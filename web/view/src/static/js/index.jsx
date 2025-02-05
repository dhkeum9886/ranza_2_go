'use strict'

import $ from 'jquery-patch'
import 'bootstrap'; // Bootstrap의 JS 기능 활성화
import '@scss/style.scss'

$(document).ready(function () {
    console.log("jQuery와 Bootstrap이 로드되었습니다.");
    $('h1').css('color', 'blue');
});

function test() {
    console.log('INDEX TEST')

}

Router.watch(document)
    .onclick()
    .route('Test', function (event, element, data) {
        test()
    })