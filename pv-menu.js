(function($) {
    var KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40;


    /** @dict */
    var defaultOptions = {
        'item_selector': '.menuitem',
        'delay': 300,
        'orientation': 'v',
        'position': {
            'my': 'left top',
            'at': 'right top'
        }
    };

    /**
     * @constructor
     */
    var Menu = function($el, options, rootOptions) {
        var that = this;
        this.$el = $el;
        this.inheritOptions = options;
        this.options_ = options = $.extend({}, defaultOptions, options, rootOptions);
        this.submenu = null;
        this.$activeItem = null;
        this.active = true;

        $el.on('mouseenter mouseleave', function(event) {
            $(that).trigger(event.type + '_');
        });

        if (options['trigger'] != 'click') {
            $(this).on('mouseenter_', function() {
                if (!that.parentNode) {
                    clearTimeout(that.closeTimer);
                }
            }).on('mouseleave_', function() {
                if (!that.parentNode) {
                    that.closeTimer = setTimeout(function() {
                        that.closeRoot();
                    }, options['delay']);
                }
            });
        }

        this.bind_();
        if (options['trigger'] == 'delay') {
            this.bindDelayed_();
        } else if (options['trigger'] == 'click') {
            this.bindClicked_();
        }

        this.bindKeyboard_();

        $el.on('click', options['item_selector'], function(event) {
            $(that).trigger(/** @type {jQuery.event} */ ({
                'type': 'action',
                'originalEvent': event,
                'closeMenu': $.proxy(that.closeRoot, that)
            }));
        });
    };

    Menu.prototype.bind_ = function() {
        var that = this,
            options = this.options_;

        this.$el.on('mouseenter', options['item_selector'], function() {
            that.closeItem_();
            that.deselectItem_();
            that.$activeItem = $(this);
            that.selectItem_();
            that.openItem_();
        });
        this.$el.on('mouseleave', options['item_selector'], function() {
            that.deselectItem_();
        });
    };

    Menu.prototype.bindDelayed_ = function() {
        var that = this,
            options = this.options_,
            timer;

        that.active = false;

        this.$el.on('mouseenter', options['item_selector'], function() {
            if (!that.active) {
                timer = setTimeout(function() {
                    that.active = true;
                    that.selectItem_();
                    that.openItem_();
                }, options['delay']);
            }
        });
        this.$el.on('mouseleave', options['item_selector'], function() {
            clearTimeout(timer);
        });
        $(this).on('menuclose', function() {
            that.active = false;
        });
    };

    Menu.prototype.bindClicked_ = function() {
        var that = this,
            options = this.options_;

        that.active = false;

        this.docClickHandler = function(event) {
            if (!that.isOrContains_(event.target)) {
                that.active = false;
                that.closeRoot();
            }
        };
        this.$el.on('click', options['item_selector'], function(event) {
            event.preventDefault();

            that.active = true;
            that.$activeItem = $(this);
            that.selectItem_();
            that.openItem_();

            that.setDocClickHandler_();
        });
        $(this).on('menuclose', function() {
            that.active = false;
        });
    };

    Menu.prototype.bindKeyboard_ = function() {
        var that = this,
            $el = this.$el,
            itemSelector = this.options_['item_selector'],
            orientation = this.options_['orientation'];

        $el.find(itemSelector).attr('tabindex', -1);
        $el.on('keydown', function(event) {
            var key = event['which'];
            if (key == 27) { // escape
                that.closeRoot();
            } else if (key == 13) { // enter
                that.$activeItem && that.$activeItem.click();
            } else if (key == (orientation == 'h' ? KEY_RIGHT : KEY_DOWN)) { // next
                that.moveSelection_(1);
            } else if (key == (orientation == 'h' ? KEY_LEFT : KEY_UP)) { // prev
                that.moveSelection_(-1);
            } else if (key == (orientation == 'h' ? KEY_DOWN : KEY_RIGHT)) { // open
                that.openItem_(true);
                var submenu = that.submenu;
                if (submenu) {
                    submenu.$activeItem = submenu.$el.find(itemSelector).first();
                    submenu.selectItem_(true);
                }
            } else if (key == (orientation == 'h' ? KEY_UP : KEY_LEFT)) { // close
                var parentMenu = that.parentNode;
                if (parentMenu) {
                    parentMenu.closeItem_();
                }
            } else {
                return;
            }

            event.preventDefault();
        });
        $el.focus(function() {
            that.setDocClickHandler_();
        });
        $el.blur(function() {
            if (!that.parentNode && !that.submenu) {
                that.deselectItem_();
                that.$activeItem = null;
                that.unsetDocClickHandler_();
            }
        });
    };

    /**
     * @param {boolean=} opt_keyboard
     * @private
     */
    Menu.prototype.selectItem_ = function(opt_keyboard) {
        if (!this.$activeItem) return;

        var $item = this.$activeItem;

        if (opt_keyboard || this.active || !$item.data('submenu')) {
            $item.addClass('active');
        }
    };

    Menu.prototype.deselectItem_ = function() {
        if (!this.$activeItem) return;

        var $item = this.$activeItem;

        if (!this.submenu) {
            $item.removeClass('active');
        }
    };

    /**
     * @param {boolean=} opt_keyboard
     * @private
     */
    Menu.prototype.openItem_ = function(opt_keyboard) {
        if (!this.$activeItem || !this.active && !opt_keyboard) return;

        var $item = this.$activeItem,
            submenu = $item.data('submenu');

        if (!submenu) return;

        if (typeof submenu === 'string') {
            submenu = $(submenu)['menu'](this.inheritOptions).data('menu');
            $item.data('submenu', submenu);
        }

        this.submenu = submenu;
        submenu.parentNode = this;

        submenu.$el.appendTo(document.body).show().position($.extend({
            'of': $item
        }, this.options_['position'])).focus();
    };

    Menu.prototype.closeItem_ = function() {
        if (this.submenu) {
            this.$el.focus();
            this.submenu.parentNode = null;
            this.submenu.close();
            this.submenu = null;
        }
    };

    Menu.prototype.close = function() {
        this.$el.hide();
        this.closeItem_();
        this.deselectItem_();
        this.$activeItem = null;
    };

    Menu.prototype.closeRoot = function() {
        if (this.parentNode) {
            this.parentNode.closeRoot();
        } else {
            this.closeItem_();
            this.deselectItem_();

            this.$activeItem = null;

            $(this).trigger('menuclose');
        }

    };

    Menu.prototype.moveSelection_ = function(step) {
        var items = this.$el.find(this.options_['item_selector']),
            activeItem,
            nextIndex,
            i, n;

        if (this.$activeItem) {
            activeItem = this.$activeItem[0];
        }

        for (i = 0, n = items.length; i < n; ++i) {
            if (activeItem == items[i]) {
                nextIndex = i + step;
                break;
            }
        }
        if (nextIndex === undefined) nextIndex = step == 1 ? 0 : n - 1;
        else if (nextIndex >= n) nextIndex = 0;
        else if (nextIndex < 0) nextIndex = n - 1;

        this.deselectItem_();
        this.$activeItem = $(items[nextIndex]);
        this.selectItem_(true);
    };

    Menu.prototype.isOrContains_ = function(el) {
        return this.$el[0] == el || $.contains(this.$el[0], el)
            || this.submenu && this.submenu.isOrContains_(el);
    };

    Menu.prototype.setDocClickHandler_ = function() {
        if (this.docClickHandler && !this.docClickHandlerAdded) {
            $(document).on('click', this.docClickHandler);
            this.docClickHandlerAdded = true;
        }
    };

    Menu.prototype.unsetDocClickHandler_ = function() {
        if (this.docClickHandler && this.docClickHandlerAdded) {
            $(document).off('click', this.docClickHandler);
            this.docClickHandlerAdded = false;
        }
    };

    $.fn['menu'] = function(options, rootOptions) {
        var menu = this.data('menu');
        if (!menu) {
            menu = new Menu(this, options, rootOptions);
            this.data('menu', menu);
        }

        return this;
    };

    $.fn['contextMenu'] = function(menu) {
        /** @param {jQuery.event=} event */
        var docClickHandler = function(event) {
            menu.isOrContains_(event.target) || root.closeRoot();
        };
        var root = {
            closeRoot: function() {
                docClickHandler && $(document).off('click', docClickHandler);
                menu.close();
                menu.parentNode = null;
            }
        };

        this.data('menu', root);

        menu = $(menu)['menu']({}).data('menu');
        this.on('contextmenu', function(event) {
            event.preventDefault();

            var $wnd = $(window),
                $menu = menu.$el,
                left = event.pageX,
                top = event.pageY;

            $menu.appendTo(document.body).show();
            menu.parentNode = root;

            var width = $menu.outerWidth(),
                height = $menu.outerHeight();

            if (event.clientX + width > $wnd.width()) {
                left -= width;
                left = Math.max(left, $wnd.scrollLeft());
            }
            if (event.clientY + height > $wnd.height()) {
                top -= height;
                top = Math.max(top, $wnd.scrollTop());
            }

            $menu.css({
                'left': left,
                'top': top
            });

            $(document).on('click', docClickHandler);
        });

        return this;
    }
})(jQuery);
