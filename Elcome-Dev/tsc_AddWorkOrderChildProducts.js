
function AddChildWorkOrderProducts(_formContext, selectedControlSelectedItemIds) {
    if (selectedControlSelectedItemIds.length === 0) {
        showAlertDialog("Select a row to proceed.");
        return;
    }

    var selectedworkorder = selectedControlSelectedItemIds[0].Id;

    Xrm.WebApi.retrieveRecord("tsc_workorderparentproduct", selectedworkorder)
        .then(function (result) {
            if (!result._tsc_workorder_value) {
                showAlertDialog("WorkOrder ID is null, cannot create child record.");
                return;
            }
            if (!result._tsc_products_value) {
                showAlertDialog("Product ID is null, cannot create child record.");
                return;
            }

            var WorkOrderData = {
                WorkorderId:     result._tsc_workorder_value,
                ParentProductId: result._tsc_products_value,
                cacheBuster:     Date.now()
            };

            // DEBUG — remove once values confirmed on device
            showAlertDialog("WorkOrder ID: " + WorkOrderData.WorkorderId);
            showAlertDialog("Parent Product ID: " + WorkOrderData.ParentProductId);

            // localStorage bridge — mobile may not pass the data URL param reliably
            try { localStorage.setItem("tsc_childproducts_params", JSON.stringify(WorkOrderData)); } catch (e) {}

            return Xrm.Navigation.navigateTo(
                {
                    pageType:        "webresource",
                    webresourceName: "tsc_Elcome.AddChildWOProducts.MobileApp.Form",
                    data:            JSON.stringify(WorkOrderData)
                },
                {
                    target: 1   // inline page — fresh load each time, Back returns to grid
                }
            );
        })
        .catch(function (error) {
            showAlertDialog("Error opening product page: " + error.message);
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
