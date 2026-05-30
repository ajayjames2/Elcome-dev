
function AddChildWorkOrderProducts(_formContext, selectedControlSelectedItemIds) {
    // DEBUG: raw window.alert bypasses Xrm.Navigation which may itself be blocked
    window.alert("RIBBON: called, count=" + selectedControlSelectedItemIds.length);

    if (selectedControlSelectedItemIds.length === 0) {
        showAlertDialog("Select a row to proceed.");
        return;
    }

    var selectedworkorder = selectedControlSelectedItemIds[0].Id;

    Xrm.WebApi.retrieveRecord("tsc_workorderparentproduct", selectedworkorder)
        .then(function (result) {
            // DEBUG: confirms retrieveRecord Promise resolved (not blocked by pending navigateTo)
            window.alert("RIBBON: .then() WO=" + result._tsc_workorder_value);

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

            // localStorage bridge — mobile may not pass the data URL param reliably
            try { localStorage.setItem("tsc_childproducts_params", JSON.stringify(WorkOrderData)); } catch (e) {}

            // IMPORTANT: do NOT return this Promise.
            // Returning it chains navigateTo into the retrieveRecord Promise chain.
            // On Power Platform mobile, navigateTo never resolves when Back is pressed,
            // so every subsequent retrieveRecord .then() callback gets queued behind it
            // and never executes — blocking all second-press API calls silently.
            Xrm.Navigation.navigateTo(
                {
                    pageType:        "webresource",
                    webresourceName: "tsc_Elcome.AddChildWOProducts.MobileApp.Form",
                    data:            JSON.stringify(WorkOrderData)
                },
                {
                    target: 1
                }
            );
        })
        .catch(function (error) {
            window.alert("RIBBON: catch " + error.message); // DEBUG
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
