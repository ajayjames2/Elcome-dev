var _navigationInProgress = false;
var _navigationResetTimer = null;

function AddChildWorkOrderProducts(_formContext, selectedControlSelectedItemIds) {
    if (_navigationInProgress) {
        // Previous dialog may still be open — reset the flag and allow re-entry
        // so the user is never permanently locked out.
        _navigationInProgress = false;
        clearTimeout(_navigationResetTimer);
    }

    if (selectedControlSelectedItemIds.length === 0) {
        showAlertDialog("Select a row to proceed.");
        return;
    }

    _navigationInProgress = true;

    // Safety reset: if navigateTo Promise never resolves (dialog not properly
    // torn down), unlock the button after 5 minutes.
    _navigationResetTimer = setTimeout(function () {
        _navigationInProgress = false;
    }, 5 * 60 * 1000);

    var selectedworkorder = selectedControlSelectedItemIds[0].Id;

    Xrm.WebApi.retrieveRecord("tsc_workorderparentproduct", selectedworkorder)
        .then(function (result) {
            if (result._tsc_workorder_value == null) {
                _navigationInProgress = false;
                showAlertDialog("WorkOrder ID is null, cannot create child record.");
                return;
            }
            if (result._tsc_products_value == null) {
                _navigationInProgress = false;
                showAlertDialog("Product ID is null, cannot create child record.");
                return;
            }

            var WorkOrderData = {
                WorkorderId:     result._tsc_workorder_value,
                ParentProductId: result._tsc_products_value,
                cacheBuster:     Date.now()
            };

            var clientType = Xrm.Utility.getGlobalContext().client.getClient();

            var navigationOptions =
                clientType === "Mobile"
                    ? {
                        target: 1
                    }
                    : {
                        target: 2,
                        width: 1000,
                        height: 600,
                        position: 1,
                        title: "Add Child Products"
                    };
            
            return Xrm.Navigation.navigateTo(
                {
                    pageType: "webresource",
                    webresourceName: "tsc_Elcome.AddChildWOProducts.MobileApp.Form",
                    data: JSON.stringify(WorkOrderData)
                },
                navigationOptions
            );
        })
        .then(function () {
            // navigateTo resolved — dialog was properly closed
            _navigationInProgress = false;
            clearTimeout(_navigationResetTimer);
        })
        .catch(function (error) {
            _navigationInProgress = false;
            clearTimeout(_navigationResetTimer);
            showAlertDialog("Error opening product dialog: " + error.message);
        });
}

function showAlertDialog(AlertMessage) {
    Xrm.Navigation.openAlertDialog(
        { confirmButtonLabel: "OK", text: AlertMessage },
        { height: 200, width: 400 }
    ).then(
        function () { console.log("Alert dialog closed."); },
        function (error) { console.log("Error opening alert dialog:", error); }
    );
}
