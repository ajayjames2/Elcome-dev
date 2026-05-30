async function AddChildWorkOrderProducts(formContext, selectedControlSelectedItemIds) {
    //debugger;
    if (selectedControlSelectedItemIds.length == 0) {
        showAlertDialog("Select a row to proceed.");
        return;
    }

    var selectedworkorder = selectedControlSelectedItemIds[0].Id;
    //var result = await Xrm.WebApi.retrieveRecord("quotedetail", quoteProductId); tsc_quotelineparentproduct
    var result = await Xrm.WebApi.retrieveRecord("tsc_workorderparentproduct", selectedworkorder);

    if (result._tsc_workorder_value == null) {
        showAlertDialog("WorkOrder ID is null cannot create child record.");
        return;
    }
    if (result._tsc_products_value == null) {
        showAlertDialog("Product Id is null cannot create child record.");
        return;
    }
    var workorderID= result._tsc_workorder_value;
    var parentProductId = result._tsc_products_value;
    var parentQuantity = 0;

    const isAndroid = /Android/i.test(navigator.userAgent);

    var WorkOrderData = {
        WorkorderId: workorderID,
        ParentProductId: parentProductId,
        ParetntQuantity: parentQuantity,
        cacheBuster: Date.now(),
        //QuoteCompany: quoteCompany,
        //ParentProductEntityId: quoteProductId
    };

    // if (isAndroid) {
    //     WorkOrderData.cacheBuster = Date.now();
    // }

    var pageInput = {
        pageType: "webresource",
        webresourceName: isAndroid ? "tsc_Elcome.AddChildWOProducts.MobileApp.Form" : "tsc_AddChildWOProducts",
        data: JSON.stringify(WorkOrderData)
    };
    var navigationOptions = {
        target: isAndroid ? 2 : 2,
        width: 1000, // Increased width
        height: 600, // Increased height
        position: 1,
        title: "Add Child Products "
    };

    Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(successCallback, errorCallback);
}

function successCallback(retrurnvalue) {
    //debugger;
    console.log("products loaded");
}

function errorCallback(error) {
    //debugger;
    console.log(error.message);
}


function showAlertDialog(AlertMessage) {
    var alertStrings = {
        confirmButtonLabel: "OK",
        text: AlertMessage
    };
    var alertOptions = {
        height: 200,
        width: 400
    };

    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
        function success() {
            console.log("Alert dialog closed.");
        },
        function error() {
            console.log("Error opening alert dialog.");
        }
    );
}