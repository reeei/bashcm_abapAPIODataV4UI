/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"jeupl_v4ui/journalentryupload_odatav4ui/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});