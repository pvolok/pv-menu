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

        if (this.options_.trigger == 'delay') {
            this.bindDelayed_();
        } else if (this.options_.trigger == 'click') {
            this.bindClicked_();
        } else {
            this.bind_();
        }
    };

    Menu.prototype.bind_ = function() {
        var that = this,
            options = this.options_;

        this.$el.on('mouseenter', options.item_selector, function() {
            that.closeItem_();
            that.$activeItem = $(this);
            that.openItem_();
        });
        this.$el.on('mouseleave', options.item_selector, function() {
            that.$activeItem.data('submenu') || that.$activeItem.removeClass('active');
        });
    };

    Menu.prototype.bindDelayed_ = function() {
        var that = this,
            options = this.options_,
            active = false,
            timer;

        this.$el.on('mouseenter', options.item_selector, function() {
            var $item = $(this);
            that.closeItem_();
            that.$activeItem = $item;
            $item.data('submenu') || $item.addClass('active');
            if (active) {
                that.openItem_();
            } else {
                timer = setTimeout(function() {
                    active = true;
                    that.openItem_();
                }, 300);
            }
        });
        this.$el.on('mouseleave', options.item_selector, function() {
            that.$activeItem.data('submenu') || that.$activeItem.removeClass('active');
            clearTimeout(timer);
        });
        $(this).on('menuclose', function() {
            active = false;
        });
    };

    Menu.prototype.bindClicked_ = function() {
        var that = this,
            options = this.options_,
            active = false;

        this.$el.on('mouseenter', options.item_selector, function() {
            var $item = $(this);
            that.closeItem_();
            that.$activeItem = $item;
            $item.data('submenu') || $item.addClass('active');
            if (active) {
                that.openItem_();
            }
        });
        this.$el.on('mouseleave', options.item_selector, function() {
            that.$activeItem.data('submenu') || that.$activeItem.removeClass('active');
        });
        var clickHandler = function(event) {
            event.preventDefault();

            var $doc = $(document);
            that.openItem_();
            active = true;

            $doc.on('click', function(event) {
                var menu = that,
                    target = event.target,
                    el;
                while (menu) {
                    el = menu.$el[0];
                    if (target === el || $.contains(el, target)) {
                        return;
                    }
                    menu = menu.submenu;
                }

                that.closeItem_();
                active = false;
                $doc.off('click', clickHandler);
            });
        };
        this.$el.on('click', options.item_selector, clickHandler);
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

    $.fn.menu = function(options, rootOptions) {
        var menu = this.data('menu');
        if (!menu) {
            menu = new Menu(this, options, rootOptions);
            this.data('menu', menu);
        }

        return this;
    };
})(jQuery);
