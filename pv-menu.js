(function($) {
    var defaultOptions = {
        item_selector: '.menuitem',
        position: {
            my: 'left top',
            at: 'right+1 top'
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
        $(this).on('mouseenter_', function() {
            that.$activeItem.addClass('active');
            if (!that.parentNode) {
                clearTimeout(that.closeTimer);
            }
        }).on('mouseleave_', function() {
            if (!that.parentNode) {
                that.closeTimer = setTimeout(function() {
                    that.closeItem_();
                }, 300);
            }
        });

        this.bind_();
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
            that.$activeItem.removeClass('active');
        });
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
