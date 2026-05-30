// WHY target:1 instead of target:2 (dialog):
//
// Field Service Mobile is a native Android app (Xamarin/MAUI) embedding WebViews.
// With target:2 the Android OS routes the Back keypress to the WebView FIRST —
// the WebView navigates its own history to about:blank before Dynamics can
// intercept. The navigateTo Promise never resolves. On the next ribbon press,
// Dynamics sees the old dialog as still pending and shows the same blank WebView.
//
// With target:1 Dynamics owns the navigation stack. Back is intercepted at the
// Activity level, the Promise resolves cleanly, and every press gets a fresh
// page load with window.onload firing correctly.

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
