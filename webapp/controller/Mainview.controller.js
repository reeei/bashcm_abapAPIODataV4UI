sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/util/File',
    'sap/m/MessageToast',
    'sap/ui/unified/FileUploader',
    'sap/m/Dialog',
    'sap/ui/core/Messaging',
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageType',
	'sap/ui/model/odata/v4/ODataContextBinding'
], (Controller,uFile,MessageToast,FileUploader,oDialog,Messaging,Message,MessageType,ODataContextBinding) => {
    "use strict";
    var namespace = "com.sap.gateway.srvd.zui_c_journalentry.v0001.";
    var fileContent;
    var fileName;
	var fileType;
	var mimeType;
	var fileExtension;

    return Controller.extend("jeuplv4ui.journalentryuploadodatav4ui.controller.Mainview", {
        onInit() {
            // console.log("te");
            // var oModel = this.base.getExtensionAPI().getModel();
        },

        // On File Change
		onFileChange: function (oEvent) {
			// Read file
			var file = oEvent.getParameter("files")[0];
			if (file === undefined) {
				return;
			}
			fileType = file.type;  //mimetype or file type
			fileName = file.name;
			//Instantiate JavaScript FileReader API
			var fileReader = new FileReader();
			//Read file content using JavaScript FileReader API


			var readFile = function onReadFile(file) {
				return new Promise(function (resolve) {
					fileReader.onload = function (loadEvent) {
						resolve(loadEvent.target.result.match(/,(.*)$/)[1]);
						fileContent = loadEvent.target.result.match(/,(.*)$/)[1];
					};
					fileReader.readAsDataURL(file);
				});
			};
			readFile(file), {
				busy: { set: true }
			};
		},

        //perform upload
		onUploadPress: function (oEvent) {
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			//check file has been entered
			if (fileContent === undefined || fileContent === "") {
				MessageToast.show(oResourceBundle.getText("uploadFileErrMsg"));
				return;
			}
            var oModel = this.getView().getModel();
			var oOperation = this.getView().getModel().bindContext("/ZC_JournalEntry/" + namespace + "fileUpload(...)");

			var fnSuccess = function () {
				oModel.refresh();
				MessageToast.show(oResourceBundle.getText("uploadFileSuccMsg"));
				
				// // this.outputResultFile();
				// oDialog.close();
				// //Clear the file name from file uploader
				// sap.ui.getCore().byId("idFileUpload").clear();
				// oDialog.destroy();
				fileContent = undefined;
				
			}.bind(this);

			var fnError = function (oError) {
				this.base.editFlow.securedExecution(
					function () {
						Messaging.addMessages(
							new sap.ui.core.message.Message({
								message: oError.message,
								target: "",
								persistent: true,
								type: sap.ui.core.MessageType.Error,
								code: oError.error.code
							})
						);
						var aErrorDetail = oError.error.details;
						aErrorDetail.forEach((error) => {
							Messaging.addMessages(
								new sap.ui.core.message.Message({
									message: error.message,
									target: "",
									persistent: true,
									type: sap.ui.core.MessageType.Error,
									code: error.code
								})
							);
						})
					}
				);
				// oDialog.close();
				// //Clear the file name from file uploader
				// sap.ui.getCore().byId("idFileUpload").clear();
				// oDialog.destroy();
				fileContent = undefined;
			}.bind(this);

			oOperation.setParameter("mimeType", fileType);
			oOperation.setParameter("fileName", fileName);
			oOperation.setParameter("fileContent", fileContent);
			oOperation.setParameter("fileExtension", fileName.split(".")[1])
			//oOperation.setParameter("process", sProcess);
			oOperation.invoke().then(fnSuccess, fnError);
		},

        onTempDownload: function (oEvent) {
            var oOperation = this.getView().getModel().bindContext("/ZC_JournalEntry/" + namespace + "downloadFile(...)");

			//Success function to display success messages from OData Operation
			var fnSuccess = function () {
				var oResults = oOperation.getBoundContext().getObject();

				var fixedFileContent = this.convertBase64(oResults.fileContent);

				var aUint8Array = Uint8Array.from(atob(fixedFileContent), c => c.charCodeAt(0)),
					oblob = new Blob([aUint8Array], { type: oResults.mimeType });

				uFile.save(oblob, oResults.fileName, oResults.fileExtension, oResults.mimeType);
				MessageToast.show(oResourceBundle.getText("downloadTempSuccMsg"));
			}.bind(this);

			//Error function to display error messages from OData Operation
			var fnError = function () {
				this.base.editFlow.securedExecution(
					function () {
						Messaging.addMessages(
							new sap.ui.core.message.Message({
								message: oError.message,
								target: "",
								persistent: true,
								type: sap.ui.core.MessageType.Error,
								code: oError.error.code
							})
						);
						var aErrorDetail = oError.error.details;
						aErrorDetail.forEach((error) => {
							Messaging.addMessages(
								new sap.ui.core.message.Message({
									message: error.message,
									target: "",
									persistent: true,
									type: sap.ui.core.MessageType.Error,
									code: error.code
								})
							);
						})
					}
				);
			}.bind(this);
            // Execute OData V4 operation i.e a static function 'downloadFile' to download the excel template
			oOperation.invoke().then(fnSuccess, fnError)
        },

        convertBase64(urlSafeBase64){
			var standardBase64 = urlSafeBase64.replace(/_/g, '/').replace(/-/g, '+');
			return standardBase64;
		}
    });
});