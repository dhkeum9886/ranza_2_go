'use strict'

import $ from 'jquery-patch'
import 'bootstrap'; // Bootstrap의 JS 기능 활성화
import '@scss/style.scss'
import '@js/api/tmp/tt'

$(document).ready(function () {
    $('h1').css('color', 'blue');
});

function test() {
    console.log('API TEST')
}

Router.watch(document)
    .onclick()
    .route('Test', function (event, element, data) {
        test()
    })