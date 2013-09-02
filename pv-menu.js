(function($) {
    var defaultOptions = {
        item_selector: '.menuitem',
        position: {
            my: 'left top',
            at: 'right top'
        }
    };

    var Menu = function($el, options, rootOptions) {
        var that = this;
        this.$el = $el;
        this.inheritOptions = options;
        this.options_ = $.extend({}, defaultOptions, options, rootOptions);
        this.submenu = null;
        this.$activeItem = null;
        this.active = true;

        $el.on('mouseenter mouseleave', function(event) {
            $(that).trigger(event.type + '_');
        });

        if (this.options_.trigger != 'click') {
            $(this).on('mouseenter_', function() {
                if (!that.parentNode) {
                    clearTimeout(that.closeTimer);
                }
            }).on('mouseleave_', function() {
                if (!that.parentNode) {
                    that.closeTimer = setTimeout(function() {
                        that.closeItem_();
                        $(that).trigger('menuclose');
                    }, 300);
                }
            });
        }

        this.bind_();
        if (this.options_.trigger == 'delay') {
            this.bindDelayed_();
        } else if (this.options_.trigger == 'click') {
            this.bindClicked_();
        }

        $el.on('click', this.options_.item_selector, function(event) {
            $(that).trigger({
                type: 'action',
                originalEvent: event,
                closeMenu: $.proxy(that.closeRoot, that)
            });
        });
    };

    Menu.prototype.bind_ = function() {
        var that = this,
            options = this.options_;

        this.$el.on('mouseenter', options.item_selector, function() {
            var $item = $(this);
            that.closeItem_();
            that.$activeItem = $item;
            that.active && that.openItem_();
            $item.data('submenu') || $item.addClass('active');
        });
        this.$el.on('mouseleave', options.item_selector, function() {
            that.$activeItem.data('submenu') || that.$activeItem.removeClass('active');
        });
    };

    Menu.prototype.bindDelayed_ = function() {
        var that = this,
            options = this.options_,
            timer;

        that.active = false;

        this.$el.on('mouseenter', options.item_selector, function() {
            if (!that.active) {
                timer = setTimeout(function() {
                    that.active = true;
                    that.openItem_();
                }, 300);
            }
        });
        this.$el.on('mouseleave', options.item_selector, function() {
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
            event.preventDefault();

            var $doc = $(document);
            that.openItem_();
            that.active = true;

            $doc.on('click', function(event) {
                if (!that.isOrContains_(event.target)) {
                    that.active = false;
                    that.closeRoot();
                }
            });
        };
        this.$el.on('click', options.item_selector, this.docClickHandler);
    };

    Menu.prototype.openItem_ = function() {
        var $item = this.$activeItem,
            submenu = $item.data('submenu');

        $item.addClass('active');

        if (!submenu) {
            return;
        }

        if (typeof submenu === 'string') {
            submenu = $(submenu).menu(this.inheritOptions).data('menu');
            $item.data('submenu', submenu);
        }

        this.submenu = submenu;
        submenu.parentNode = this;

        submenu.$el.appendTo(document.body).show().position($.extend({
            of: $item
        }, this.options_.position));
    };

    Menu.prototype.closeItem_ = function() {
        this.$activeItem && this.$activeItem.removeClass('active');
        if (this.submenu) {
            this.submenu.parentNode = null;
            this.submenu.close();
            this.submenu = null;
        }
    };

    Menu.prototype.close = function() {
        this.$el.hide();
        this.closeItem_();
    };

    Menu.prototype.closeRoot = function() {
        if (this.parentNode) {
            this.parentNode.closeRoot();
        } else {
            this.closeItem_();
            this.docClickHandler && $(document).off('click', this.docClickHandler);
        }

    };

    Menu.prototype.isOrContains_ = function(el) {
        return this.$el[0] == el || $.contains(this.$el[0], el)
            || this.submenu && this.submenu.isOrContains_(el);
    };

    $.fn.menu = function(options, rootOptions) {
        var menu = this.data('menu');
        if (!menu) {
            menu = new Menu(this, options, rootOptions);
            this.data('menu', menu);
        }

        return this;
    };

    $.fn.contextMenu = function(menu) {
        var docClickHandler;
        var root = {
            closeRoot: function() {
                docClickHandler && $(document).off('click', close);
                menu.close();
                menu.parentNode = null;
            }
        };

        this.data('menu', root);

        menu = $(menu).menu({}).data('menu');
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
                left: left,
                top: top
            });

            $(document).on('click', docClickHandler = function(event) {
                menu.isOrContains_(event.target) || root.closeRoot();
            });
        });

        return this;
    }
})(jQuery);
