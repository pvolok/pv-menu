(function($) {
    var defaultOptions = {
        item_selector: '.menuitem',
        delay: 400
    };

    var Menu = function($el, options) {
        this.$el = $el;
        this.options_ = $.extend({}, defaultOptions, options);

        $el.css({
            position: 'absolute'
        }).appendTo(document.body);

        this.bind_();
    };

    Menu.prototype.bind_ = function() {
        var that = this,
            options = this.options_;

        var openedItem,
            activeItem,
            openTimer;

        this.$el.on('mouseenter', options.item_selector, function() {
            activeItem = this;
            openTimer = setTimeout(onOpenTimer, openedItem ? 0 : options.delay);
        });
        this.$el.on('mouseleave', options.item_selector, function() {
            $(this).removeClass('active');
        });

        function onOpenTimer() {
            if (openedItem) {
                that.closeItem_(openedItem);
            }

            openedItem = activeItem;
            that.openItem_(openedItem);
        }
    };

    Menu.prototype.openItem_ = function(el) {
        var $el = $(el),
            submenu = $el.data('submenu');

        if (!submenu) {
            return;
        }

        if (typeof submenu === 'string') {
            submenu = $(submenu).menu(this.options_).data('pv-menu');
            $el.data('submenu', submenu);
        }

        submenu.$el.show().position({
            of: el,
            my: 'left top',
            at: 'right top'
        });
    };

    Menu.prototype.closeItem_ = function(el) {
        var $el = $(el),
            submenu = $el.data('submenu');

        if (submenu) {
            submenu.$el.hide();
        }
    };

    $.fn.menu = function(options) {
        var menu = this.data('pv-menu');
        if (!menu) {
            menu = new Menu(this, options);
            this.data('pv-menu', menu);
        }

        return this;
    };
})(jQuery);
