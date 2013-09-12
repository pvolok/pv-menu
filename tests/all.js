test('default menu test', function() {
    $('#qunit-fixture').append(createMenu());

    var $menubar = $('#menubar').menu({}),
        $menu2 = $('#menu2');

    ok(!$menu2.is(':visible'), 'Sub menu should be hidden initially');
    $menubar.find('.menuitem').eq(1).mouseenter();
    ok($menu2.is(':visible'), 'Sub menu should be visible');
});

test('delayed menu test', function() {
    $('#qunit-fixture').append(createMenu());

    var $menubar = $('#menubar').menu({}, {trigger: 'delay', delay: 1}),
        $menu2 = $('#menu2');

    $menubar.find('.menuitem').eq(1).mouseenter();
    ok(!$menu2.is(':visible'), 'Menu should not open immediately');
    stop();
    setTimeout(function() {
        start();
        ok($menu2.is(':visible'), 'Menu should be visible after a delay');
    }, 2);
});

test('clickable menu test', function() {
    $('#qunit-fixture').append(createMenu());

    var $menubar = $('#menubar').menu({}, {trigger: 'click'}),
        $menu2 = $('#menu2');

    ok(!$menu2.is(':visible'), 'Menu should be hidden initially');
    $menubar.find('.menuitem').eq(1).click();
    ok($menu2.is(':visible'), 'Menu should be visible after a click');
});

QUnit.testDone(function() {
    $('.menubar, .menu').remove();
});

function createMenu() {
    var html = '',
        i, attrs;

    html += '<div id="menubar" class="menubar">';
    for (i = 1; i <= 4; ++i) {
        attrs = i == 2 ? 'data-submenu="#menu2"' : '';
        html += '<a href="javascript:" class="menuitem" ' + attrs + '>Item ' + i + '</a>';
    }
    html += '</div>';

    html += '<div id="menu2" class="menu">';
    for (i = 1; i <= 3; ++i) {
        attrs = i == 3 ? 'data-submenu="#menu23"' : '';
        html += '<a href="javascript:" class="menuitem" ' + attrs + '>Subitem ' + i + '</a>';
    }
    html += '</div>';

    html += '<div id="menu23" class="menu">';
    for (i = 1; i <= 3; ++i) {
        html += '<a href="javascript:" class="menuitem">Subitem 2 ' + i + '</a>';
    }
    html += '</div>';

    return html;
}
