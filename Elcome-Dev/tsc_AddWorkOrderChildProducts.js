// No async/await — Dynamics mobile ribbon infrastructure does not await the
// returned Promise, so any async function risks silent failures on mobile.
// Pure .then()/.catch() chains are handled synchronously by the ribbon call.
function AddChildWorkOrderProducts(_formContext, selectedControlSelectedItemIds) {
    if (selectedControlSelectedItemIds.length === 0) {
        showAlertDialog("Select a row to proceed.");
        return;
    }

    var selectedworkorder = selectedControlSelectedItemIds[0].Id;

    Xrm.WebApi.retrieveRecord("tsc_workorderparentproduct", selectedworkorder)
        .then(function (result) {
            if (result._tsc_workorder_value == null) {
                showAlertDialog("WorkOrder ID is null, cannot create child record.");
                return;
            }
            if (result._tsc_products_value == null) {
                showAlertDialog("Product ID is null, cannot create child record.");
                return;
            }

            var WorkOrderData = {
                WorkorderId:     result._tsc_workorder_value,
                ParentProductId: result._tsc_products_value,
                cacheBuster:     Date.now()
            };

            return Xrm.Navigation.navigateTo(
                {
                    pageType:        "webresource",
                    webresourceName: "tsc_Elcome.AddChildWOProducts.MobileApp.Form",
                    data:            JSON.stringify(WorkOrderData)
                },
                {
                    target:   2,
                    width:    1000,
                    height:   600,
                    position: 1,
                    title:    "Add Child Products"
                }
            );
        })
        .catch(function (error) {
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
