// Ribbon entry point — must NOT be async.
// Dynamics calls this synchronously and does not await the returned Promise,
// so an async top-level function silently swallows any post-await errors.
function AddChildWorkOrderProducts(_formContext, selectedControlSelectedItemIds) {
    _addChildWorkOrderProductsAsync(selectedControlSelectedItemIds)
        .catch(function (error) {
            showAlertDialog("Error opening product dialog: " + error.message);
        });
}

async function _addChildWorkOrderProductsAsync(selectedControlSelectedItemIds) {
    if (selectedControlSelectedItemIds.length === 0) {
        showAlertDialog("Select a row to proceed.");
        return;
    }

    var selectedworkorder = selectedControlSelectedItemIds[0].Id;
    var result = await Xrm.WebApi.retrieveRecord("tsc_workorderparentproduct", selectedworkorder);

    if (result._tsc_workorder_value == null) {
        showAlertDialog("WorkOrder ID is null, cannot create child record.");
        return;
    }
    if (result._tsc_products_value == null) {
        showAlertDialog("Product ID is null, cannot create child record.");
        return;
    }

    var workorderID     = result._tsc_workorder_value;
    var parentProductId = result._tsc_products_value;

    var WorkOrderData = {
        WorkorderId:     workorderID,
        ParentProductId: parentProductId,
        cacheBuster:     Date.now()
    };

    var pageInput = {
        pageType:        "webresource",
        webresourceName: "tsc_Elcome.AddChildWOProducts.MobileApp.Form",
        data:            JSON.stringify(WorkOrderData)
    };

    var navigationOptions = {
        target:   2,
        width:    1000,
        height:   600,
        position: 1,
        title:    "Add Child Products"
    };

    await Xrm.Navigation.navigateTo(pageInput, navigationOptions);
}

function showAlertDialog(AlertMessage) {
    var alertStrings = { confirmButtonLabel: "OK", text: AlertMessage };
    var alertOptions = { height: 200, width: 400 };
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
        function () { console.log("Alert dialog closed."); },
        function (error) { console.log("Error opening alert dialog:", error); }
    );
}
