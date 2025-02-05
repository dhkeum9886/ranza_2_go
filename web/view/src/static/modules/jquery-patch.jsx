'use strict';
import $ from 'jquery';

global.jQuery = global.$ = $

import 'patches/polyfill';
import 'patches/utility';
import 'patches/hotkey';
import 'patches/functions';
import 'patches/event';

export default $;
