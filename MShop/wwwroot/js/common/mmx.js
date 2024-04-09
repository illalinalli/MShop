/* Copyright 2015-2022 Arseny Speransky*/

var OldName, NewName;
var OldName_, NewName_;

function FixAttribute(elem, attrName, oldName, newName)
{
    var a = elem.attr(attrName);
    if (!(a === undefined)) {
        var p = a.indexOf(oldName);
        if (p !== -1) {
            var b = newName + a.slice(p + oldName.length);
            elem.attr(attrName, b);
            console.log(attrName, a, b);
        }
    }
}

function FixAttributes(elem)
{
    FixAttribute(elem, "id", OldName_, NewName_);
    FixAttribute(elem, "for", OldName_, NewName_);
    FixAttribute(elem, "name", OldName, NewName);
    FixAttribute(elem, "data-valmsg-for", OldName, NewName);
    FixAttribute(elem, "data-list-name", OldName, NewName);
    FixAttribute(elem, "data-list-ref", OldName, NewName);
    FixAttribute(elem, "data-target", OldName_, NewName_);
}

var regexDelims = new RegExp("[\\[\\.\\]]", 'g');

function ListItemCreateIndex(Item, SpareName, NewIndex)
{
    Item.attr('data-list-index', NewIndex);
    var GenName = Item.attr('data-list-name');
    OldName = SpareName; OldName_ = OldName;
    NewName = GenName + '[' + NewIndex + ']'; NewName_ = NewName.replace(regexDelims, '_');
    FixAttributes(Item);
    Item.find('*').each(function (index, elem) { FixAttributes($(elem)); });
}

function ListItemChangeIndex(Item, NewIndex)
{
    var OldIndex = parseInt(Item.attr('data-list-index'));
    if (OldIndex === NewIndex) return;

    Item.attr('data-list-index', NewIndex);
    var GenName = Item.attr('data-list-name');
    OldName = GenName + '[' + OldIndex + ']'; OldName_ = OldName.replace(regexDelims, '_');
    NewName = GenName + '[' + NewIndex + ']'; NewName_ = NewName.replace(regexDelims, '_');
    FixAttributes(Item);
    Item.find('*').each(function (index, elem) { FixAttributes($(elem)); });
}

function ListAddNewItemKeyDown(elem, event)
{
    let ev = jQuery.Event("keydown", event);
    if (ev.target !== elem) return;
    if (ev.key === "Enter" || ev.code === "Space") {
        eventFire(elem, "click");
    }


}

function ListAddNewItem(button, SpareItemName)
{
    var container = $(button).closest(".list-container");
    var ListName = container.attr('data-list-ref');
    var ExistingItems = container.find('[data-list-name="' + ListName + '"]');
    var NewItem = ExistingItems.filter('[data-list-index="-1"]')[0];
    var s = NewItem.outerHTML;
    var ItemCount = ExistingItems.length - 1;
    NewItem = $(NewItem).before(s).prev().removeClass("hidden d-none");
    ListItemCreateIndex(NewItem, SpareItemName, ItemCount);
    // support for bootstrap-datetime
    //SetupDateTimePickers(NewItem.find('.input-group.date'));
    PhasedItemsSort(NewItem[0]);
}

function ListDeleteAllItems(button)
{
    var $button = $(button);
    var container = $button.closest(".list-container");
    var ListName = container.attr('data-list-ref');
    var ExistingItems = $button.parent().parent().parent().find('[data-list-name="' + ListName + '"]');
    ExistingItems.filter('[data-list-index!="-1"]').remove();
}

function ListItemMoveUpDownRe(button, command)
{
    var $button = $(button);
    var container = $button.closest(".list-container");
    var ListName = container.attr('data-list-ref');
    var ListItem = $button.closest('[data-list-name="' + ListName + '"]');
    var CurrentIndex = parseInt(ListItem.attr('data-list-index'));
    var parent = ListItem.parent();

    switch (command) {
        case "up":
            if (CurrentIndex === 0) return;
            ListItem.prev().before(ListItem);
            break;
        case "down":
            var totalItems = parent.children('[data-list-index!="-1"]').filter('[data-list-index]').length;
            if (CurrentIndex === totalItems - 1) return;
            ListItem.next().after(ListItem);
            break;
        case "remove":
            ListItem.remove();
            break;
        case "clone":
            var s = ListItem.clone(true, true);//.outerHTML;
            ListItem.after(s);
            break;
    }

    var ii = parent.children('[data-list-index!="-1"]').filter('[data-list-index]');
    ii.each(function (index, elem) { ListItemChangeIndex($(elem), index); });
}

function PhasedItemsSort(trigger) {
    var $trigger = $(trigger);
    var ii = $($trigger.closest(".list-container")[0]).children('[data-list-index!="-1"]').filter('[data-list-index]');
    if (ii.length === 1) return;
    var currentIndex = -1;
    for (var i = 0; i < ii.length; i++) {
        if (ii[i] === trigger) {
            currentIndex = i;
            break;
        }
    }

    var thisDate = $trigger.attr("data-phased-date");
    if (typeof thisDate === "undefined") return;

    var A = i === 0 || $(ii[i - 1]).attr("data-phased-date") <= thisDate;
    var B = i === ii.length - 1 || thisDate <= $(ii[i + 1]).attr("data-phased-date");
    if (A && B) return;

    var j;
    if (!A) { // перед i есть элемент с большей датой.
        j = i - 2;
        while (j >= 0 && $(ii[j]).attr("data-phased-date") > thisDate) j--;
        $(ii[j + 1]).before($trigger);

        ii = $($trigger.closest(".list-container")[0]).children('[data-list-index!="-1"]').filter('[data-list-index]');
        ii.each(function (index, elem) { ListItemChangeIndex($(elem), index); });
        return;
    }

    if (!B) { // !B === true // после i есть элемент с меньшей датой.
        j = i + 2;
        while (j < ii.length && thisDate > $(ii[j]).attr("data-phased-date")) j++;
        $(ii[j - 1]).after($trigger);

        ii = $($trigger.closest(".list-container")[0]).children('[data-list-index!="-1"]').filter('[data-list-index]');
        ii.each(function (index, elem) { ListItemChangeIndex($(elem), index); });
        return;
    }

    alert("$hit!");
}

function ListItemMoveUp(button) {
    ListItemMoveUpDownRe(button, "up");
}

function ListItemMoveDown(button) {
    ListItemMoveUpDownRe(button, "down");
}

function ListItemRemove(button) {
    ListItemMoveUpDownRe(button, "remove");
}

function ListItemClone(button) {
    ListItemMoveUpDownRe(button, "clone");
}

function ConfirmDeleteRu(name) {
    return confirm("Вы уверены, что хотите удалить объект " + name + "?\nОперация необратима.");
}

function ConfirmDeleteEn(name) {
    return confirm("Are you sure you want to delete the object " + name + "?\nThe operation is irreversible.");
}

function _SetupDateTimePickers(Z) {
    Z.each(function (A) {
        var $this = $(this);
        $this.datetimepicker({
            locale: 'ru',
            format: $this.data("format")
        });
        $this.on("dp.change", function (e) {
            var $this = $(this);
            var d = $this.data("DateTimePicker").date();
            var fg = $this.closest(".form-group").filter("[data-phased-date]");
            if (fg.length > 0) {
                $(fg[0]).attr("data-phased-date", d.format("YYYY-MM-DDTHH:mm:ss"));
                PhasedItemsSort(fg[0]);
            }
        });
    });
}

//function TempusDominus(Z) {
//    Z.each(function () {
//        var $this = $(this);
//        $this.tempusDominus();
        
//    });
//}



//------------------------------------------------------------------------------------
function eventFire(el, etype)
{
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, false, false);
        el.dispatchEvent(evObj);
    }
}

var PickFormKeyHolder;
var PickFormValueDisplay;

function GetPickFormContainer()
{
    var PFC = $("#PickFormContainer");
    if (PFC.length === 0) {
        c = $("body").children();
        c = $(c[c.length - 1]);
        c.after("<div id='PickFormContainer'></div>");
        PFC = $("#PickFormContainer");
    }
    return PFC;
}

function PickFormShow(sender, functionKey)
{
    var PFC = GetPickFormContainer();
    PickFormValueDisplay = $(sender);
    var Picker = PickFormValueDisplay.parent();
    PickFormKeyHolder = Picker.children("input[type='hidden']");
    var selectedId = PickFormKeyHolder.val();
    var filter = Picker.data("filter");
    $.ajax({
        url: "/ru/Admin/srv_PickForm/" + functionKey + "?SelectedId=" + selectedId + (filter ? "&Filter=" + filter : ""),
        method: "GET",
        success: function (Data, Status, jqXHR) {
            PFC.html(Data);
            $(".MmxPickFormSubmit").click(PickFormConfirm);
            $("#MmxPickForm").modal();
        }
    });
}

function PickFormShowBS5(sender, functionKey) {
    var PFC = GetPickFormContainer();
    PickFormValueDisplay = $(sender);
    var Picker = PickFormValueDisplay.parent();
    PickFormKeyHolder = Picker.children("input[type='hidden']");
    var selectedId = PickFormKeyHolder.val();
    var filter = Picker.data("filter");
    $.ajax({
        url: "/ru/Admin/srv_PickForm/" + functionKey + "?SelectedId=" + selectedId + (filter ? "&Filter=" + filter : ""),
        method: "GET",
        success: function (Data, Status, jqXHR) {
            PFC.html(Data);
            $(".MmxPickFormSubmit").click(PickFormConfirm);
            $("#MmxPickForm").modal().show();
            //var myModal = new bootstrap.Modal(document.getElementById('MmxPickForm'), options)
            //myModal.show();
        }
    });
}

var MultiChoiceInitiator;

function MultiChoiceFormShow(sender, functionKey)
{
    var PFC = GetPickFormContainer();
    MultiChoiceInitiator = $(sender);
    var Container = MultiChoiceInitiator.parent();
    var KeyHolders = Container.children("input[type='hidden']");
    var selectedIds = "";
    for (var i = 0; i < KeyHolders.length; i++) {
        kh = $(KeyHolders[i]);
        selectedIds += kh.val() + ",";
    }
    $.ajax({
        url: "/ru/Admin/srv_MultiChoiceForm/" + functionKey + "?SelectedIds=" + selectedIds,
        method: "GET",
        success: function (Data, Status, jqXHR) {
            PFC.html(Data);
            $("#MmxMultiChoiceFormSubmit").click(MultiChoiceFormConfirm);
            $("#MmxMultiChoiceForm").modal();
        }
    });
}

function PickFormConfirm()
{
    $this = $(this);
    var id = $this.data("code");
    PickFormKeyHolder.val(id);
    var h = $this./*parent().prev().*/html();
    PickFormValueDisplay.html(h);
    $("#MmxPickForm").modal("hide");

    var Picker = PickFormValueDisplay.parent();
    eventFire(Picker[0], 'volumechange');
}
            

function MultiChoiceFormConfirm() {
    var baseName = MultiChoiceInitiator.data("name");
    var Container = MultiChoiceInitiator.parent();
    Container.children("input, div.not-a-button").remove();
    var checkboxes = $("#MmxMultiChoiceForm").find("input:checked");
    for (var i = 0; i < checkboxes.length; i++) {
        var cb = checkboxes[i];
        var id = cb.id.substr(6);
        Container.append("<input type=\"hidden\" name=\"" + baseName + "[" + i + "].KeyAsString\" value=\"" + id + "\" /><div class=\"btn btn-default not-a-button\">" + $(cb).next().next().html().substr(13) + "</div> ");
    }
    $("#MmxMultiChoiceForm").modal("hide");
    GetPickFormContainer().html("");
}

function PickFormSetNull(sender)
{
    var Picker = $(sender).parent();
    PickFormValueDisplay = Picker.children("[data-picker='Display']");
    PickFormValueDisplay.html("<span class='glyphicon glyphicon-option-horizontal'></span>");
    PickFormKeyHolder = Picker.children("input[type='hidden']");
    PickFormKeyHolder.val("000000000000000000000000");
    var PickFormValueContainer2 = Picker.children("input[type='text']");
    PickFormValueContainer2.val("");

    eventFire(Picker[0], 'volumechange');
}

function PickFormAddLookupValue(sender, LN)
{
    var Picker = $(sender).parent();
    PickFormValueDisplay = Picker.children("[data-picker='Display']");
    PickFormKeyHolder = Picker.children("input[type='hidden']");
    var PickFormValueContainer2 = Picker.children("input[type='text']");
    var v = PickFormValueContainer2.val();
    if (!v) return;

    var filter = Picker.data("filter");
    $.ajax({
        url: "/ru/Admin/srv_PickForm_Add/" + LN + "?NewVal=" + encodeURIComponent(v) + (filter ? "&Filter=" + filter : ""),
        method: "POST",
        //timeout: 120000,
        success: function (Data, Status, jqXHR) {
            PickFormValueDisplay.html(Data.value);
            PickFormKeyHolder.val(Data.id);
            PickFormValueContainer2.val("");
            eventFire(Picker[0], 'volumechange');
        }
    });
}

//--------------------------------------------------------------------------------------------
function PropertyTypeChanged(sender, TargetBlock)
{
    var SSender = $(sender);
    var newFilter = SSender.children("input[type='hidden']").val();
    var Picker = SSender.parent().parent().parent().children("[data-picker='" + TargetBlock + "']").find("[data-filter]");
    Picker.data("filter", newFilter);
    var PickFormValueLabel = Picker.children("[data-picker='Display']"); // use it because PickFormSetNull needs its parent only
    PickFormSetNull(PickFormValueLabel[0]);
}

//--------------------------------------------------------------------------------------------
function UpdateWarePreview(sender)
{
    var btn = $(sender);
    var cont = btn.closest(".row");
    var input = cont.find("input[type=text]");
    var fn = input.val();
    $.ajax({
        url: "/ru/Admin/srv_WarePrev/" + encodeURIComponent(fn),
        method: "GET",
        //timeout: 120000,
        success: function (Data, Status, jqXHR) {
            cont.parent().find("[data-tag='Preview']").html(Data);
        }
    });
}

function UpdatePreview(sender)
{
    var btn = $(sender);
    var cont = btn.parent().parent().parent();
    var input = cont.find("input[type=text]");
    var fn = input.val();
    $.ajax({
        url: "/ru/Admin/srv_ImgPrev/" + encodeURIComponent(fn),
        method: "GET",
        //timeout: 120000,
        success: function (Data, Status, jqXHR) {
            btn.next("[data-tag='PicInfo']").html(Data.info);
            cont.parent().find("[data-tag='PictureRu']").html(Data.html);
        }
    });
}

//--------------------------------------------------------------------------------------------
function CollapserClick(ev)
{
    var a = $(ev.target);
    var p = a.closest("[data-treepath]");//.parent().parent();
    var k = p.data("treepath");
    var caption = a.html();
    if (caption === "&nbsp;") return;
    var subitems = $('tr[data-treepath^="' + k + '-"]');
    if (subitems.length === 0) { a.html("&nbsp;"); return; }
    if (caption === "–") {
        a.html("+");
        subitems.hide();
    } else {
        a.html("–");
        var protector = '_';
        var i; 
        for (i = 0; i < subitems.length; i++) {
            var ii = $(subitems[i]);
            if (ii.data("treepath").startsWith(protector)) continue;
            if (ii.find(".collapser").html() === "+") protector = ii.data("treepath") + "-";
            ii.show();
        };
    }
}

function CollapseAll()
{
    $("tr[data-treepath]").each(function (index, item) { $(item).find(".collapser").first().html("+"); }).filter('[data-treepath*=-]').hide();
}

function ExpandAll()
{
    var alltr = $("tr[data-treepath]");
    alltr.show().each(function (index, item) {
        var $item = $(item);
        var k = $item.data("treepath");
        var subitems = alltr.filter('[data-treepath^="' + k + '-"]');
        $item.find(".collapser").first().html(subitems.length > 0 ? "–" : "&nbsp;");
    });
}


function TreeClick(ev) // dispatcher
{
    var a = $(ev.target);

    if (a.hasClass("lap")) return TreeCollapserClick(ev, 'toggle');

    if (a.hasClass("NewWindow")) {
        ev.preventDefault();
        ev.stopPropagation();
        OpenHrefInNewWindow(a.attr("href"));
        return;
    }

    if (a.hasClass("linked-mark") || a.hasClass("recommended-mark")) return MarkByIds(a.data('linked'), a.closest('tr'));
}

function OpenInNewWindow() 
{
    let a = $(event.target).closest("a");
    event.preventDefault();
    event.stopPropagation();
    OpenHrefInNewWindow(a.attr("href"));
}

function OpenHrefInNewWindow(href, context) 
{
    window.open(href, context);
    //window.open(href, "_blank");
}

function OpenHref(href) 
{
    window.open(href, "_self");
}

function TreeCollapserClick(ev, mode)
{
    var a = $(ev.target);
    var p = a.closest("[data-treepath]");
    var k = p.data("treepath");
    var flag = p.data("expanded");
    if (typeof flag === "undefined") return;
    var subitems = $('tr[data-treepath^="' + k + '-"]');

    a = p.find(".final.lap");
    if (flag === 1) { // collapsing
        if (mode === 'open') return; // already open
        p.data("expanded", 0);
        if (a.hasClass("t6")) { a.removeClass("t6").addClass("t4"); } else if (a.hasClass("t7")) { a.removeClass("t7").addClass("t5"); }
        subitems.hide();
    } else { // expanging
        if (mode === 'close') return; // already closed
        var expand = (ev.ctrlKey ? 1 : 0) + (ev.shiftKey ? 1 : 0);
        if (expand > 0) {
            subitems.remove();
            subitems = [];
        }
        expand += 2;
        if (subitems.length > 0) {
            p.data("expanded", 1);
            if (a.hasClass("t4")) { a.removeClass("t4").addClass("t6"); } else if (a.hasClass("t5")) { a.removeClass("t5").addClass("t7"); }
            var protector = '_';
            var i;
            for (i = 0; i < subitems.length; i++) {
                var ii = $(subitems[i]);
                if (ii.data("treepath").startsWith(protector)) continue;
                if (ii.data("expanded") === 0) protector = ii.data("treepath") + "-";
                ii.show();
            };
        } else {
            $.ajax({
                url: AjaxAddress + p.data("id") + "?signs=" + p.data("signs") + "&expand=" + expand + AjaxAddressAddendum,
                method: "GET",
                success: function (Data, Status, jqXHR) {
                    p.replaceWith(Data);
                }
            });
        }
    }
}

function UpdateRows(id)
{
    var p = $('tr[data-id="' + id + '"]');
    if (p.length !== 1) return;

    $.ajax({
        url: AjaxAddress + id + "?signs=" + p.data("signs") + "&expand=" + p.data("expanded") + AjaxAddressAddendum,
        method: "GET",
        success: function (Data, Status, jqXHR) {
            var k = p.data("treepath");
            var subselector = 'tr[data-treepath^="' + k + '-"]';
            var wasvisible = p.css("display") === "table-row";
            $(subselector).remove();
            p.replaceWith(Data);
            if (!wasvisible) {
                $('tr[data-treepath="' + k + '"],' + subselector).hide();
            }
        }
    });
    // still inconsistency may arise when changed both item and an order of it's parent's subitems by different operators.
}

function EnsureVisible($p) {
    var k = $p.data("treepath");
    var pathparts = k.split('-');
    for (var i = 0; i < pathparts.length - 1; i++) {
        k = pathparts.slice(0, i + 1).join('-');
        TreeCollapserClick({ target: $('tr[data-treepath="' + k + '"]')[0], ctrlKey: 0, shiftKey: 0 }, 'open');
    }
}


function MarkRow($p)
{
    EnsureVisible($p);
    var c = $p.find(".row-checkbox .check-box");
    c[0].checked = true;

}

function MarkByIds(ids, $org) {
    $(".row-checkbox > input[type=checkbox]").each(function () { this.checked = false });
    var idlist = ids.split(',');
    for (var i = 0; i < idlist.length; i++) {
        var $p = $('tr[data-id="' + idlist[i] + '"]');
        if ($p.length === 1) MarkRow($p);
    }
    MarkRow($org);
}

var updatingNow = false;

function UpdateChanges()
{
    if (updatingNow) return;
    updatingNow = true;
    $.ajax({
        url: "/ru/Admin/GetTreeUpdates/" + UpdateId + "?start=" + StartMoment,
        success: function (Data, Status, jqXHR) {
            if (typeof Data.ids !== "undefined") {
                for (i = 0; i < Data.ids.length; i++)
                    UpdateRows(Data.ids[i]);
                StartMoment = Data.newstart;
            }
            updatingNow = false;
        },
        error: function () {
            updatingNow = false;
        }
    });
}

function SubmitAndStay(source) {
    $(source).closest("form").ajaxSubmit({
        url: window.location.href,
        success: function () {
        }
    });
}

function SubmitAndClose(source)
{
    $(source).closest("form").ajaxSubmit({
        url: window.location.href,
        success: function () {
            window.close();
        }
    });
}

//function MaskedStep(elem) {
//    elem = $(elem);
//    $.ajax("/ru/Foliage/MaskedStep", {
//        method: "POST",
//        data: {
//            text: elem.val(),
//            position: elem[0].selectionStart,
//            pattern: elem.data("pattern")
//        },
//        success: function (data) {
//            elem.val(data.text);
//            elem[0].selectionStart = data.position,
//            elem[0].selectionEnd = data.position
//        }
//    });
//}

// ViewSettings

function setViewSettingsCookie(cookieName, refresh) {
    document.cookie = cookieName + "=" + btoa(JSON.stringify(viewSettings)) + "; path=/; samesite=strict; max-age=316224000";
    if (refresh) {
        let s = window.location.href;
        let p = s.indexOf("#");
        if (p != -1) s = s.substr(0, p);
        window.location.href = s;
    }
}

function strQuote(str, separator, quotator, forceQuoted)
{
    if (!str)
        return forceQuoted ? quotator + quotator : "";

    str = str.replaceAll("\u202F", ""); // ugly hack to remove separators
    str = str.replaceAll("\n", " "); // ugly hack to remove newlines. csv parsers are poor.
    if (forceQuoted || str.includes(separator) || str.includes(quotator)) {
        str = quotator + str.replaceAll(quotator, quotator + quotator) + quotator;
    }
    return str;
}

function strMerge(strings, separator, Quotator, ForceQuoted)
{
    let str = "";
    for (let i = 0; i < strings.length; i++) {
        if (i > 0) str += separator;
        str += strQuote(strings[i], separator, Quotator, ForceQuoted);
    }
    return str;
}

function setClipboard(text) {
    let result = true;
    try {
        var type = "text/plain";
        var blob = new Blob([text], { type });
        var data = [new ClipboardItem({ [type]: blob })];
        navigator.clipboard.write(data).then(() => { console.log("Success"); }, () => { console.log("Failure"); });
    }
    catch {
        result = false;
    }
    return result;
}

function setDocumentTitle(title) {
    document.title = title;
}

function getNewObjectId(entityName, next) {
    $.ajax("/ru/Admin/GetId/" + entityName, {
        method: "GET",
        success: function (Data, Status, jqXHR) {
            next(Data);
        }
    });
}

function makeSureItemIsVisible(container, item, topMargin, bottomMargin)
{
	container = $(container); 
    item = $(item);
    
    let wh = $(window).height();
	let cst = container.scrollTop();
	let ih = item.height();
	let it = item.offset().top - container.offset().top;

	if (it - topMargin < cst) {
		container.scrollTop(it - topMargin);
    } else if (it + ih > cst + wh - bottomMargin) {
        container.scrollTop(it + ih - wh + bottomMargin);
	}
}

function playSound(soundfile)
{
    var audio = new Audio(soundfile);
    audio.play();
}

function closeWindow()
{
    window.close();
}

function forceReload()
{
    window.location.href = window.location.href;
}

function copyTableDataToClipboard(tab0) {
    tab0 = $(tab0);
    let rows0 = tab0.children("tbody").children("tr");
    let count = rows0.length;

    var collected = "";
    for (let i = 0; i < count; i++) {
        let r0 = $(rows0[i]);
        if (r0.hasClass("do-not-copy")) continue;
        let line = [];
        let tds = r0.find("td");
        for (let j = 0; j < tds.length; j++) line.push(tds[j].innerText);
        collected += strMerge(line, '\t', '"', false) + "\n";
    }

    if (!setClipboard(collected)) {
        var cb = $("#clipboard");
        if (cb.length) cb.val(collected);
    }
}

function onTextAreaInput(ev)
{
    var target = $(ev.target);
    let t = target.val();
    let l = t.length;
    let c = 1;
    for (var i = 0; i < l; i++) if (t[i] == '\n') c++;
    let curRows = Number(target.attr("rows") || 2);
    if ((c > curRows && target.height() < $(window).height() / 2) || (c < curRows && c >= 2)) {
        target.attr("rows", c);
    }
}

function ToggleNextRow(src) 
{
    $(src).closest('tr').next('tr').toggle();
}

function SetInputValue(dest, value)
{
    $(dest).val(value);
}

function SetAttr(dest, attr, value)
{
    $(dest).attr(attr, value);
}

function CallMethod(elem, method, param1)
{
    elem[method](param1);
}

function MakeDroppable(element, input)
{
    if (typeof element.wasMadeDroppable != "undefined")
        return;
    
    element.wasMadeDroppable = true;

    element.addEventListener('dragover', function (e) {
        element.classList.add('dragover');
    });

    input.addEventListener('dragleave', function (e) {
        element.classList.remove('dragover');
    });

    element.addEventListener('drop', function (e) {
        element.classList.remove('dragover');
    });

    element.addEventListener('paste', function(e) {
       
    });
}

function mangleMarkedClickEvent(event)
{
    event.ignore = typeof event.ignore !== 'undefined';
    if (event.ignore) return null;
    return event;
}

function resetFileInput(elem)
{
    elem.files = null;
    elem.value = null;
}

function markedClick(event)
{
	let ev = jQuery.Event("click", event);
	let target = $(ev.target);
    let mark = null;
    let block = ev.currentTarget;
    while (true) {
        mark = target.data("mark");
        if (mark) break;
        if (target[0] == block) break;
        target = target.parent();
    }

    if (mark) {
        event.stopPropagation();
        event.preventDefault();

        var newEvent = new Event("markedclick", { bubbles: true });
        newEvent.mark = mark;

        let ofs = target.offset();
        newEvent.markedX = ev.pageX - ofs.left;
        newEvent.markedY = ev.pageY - ofs.top;

        ofs = $(block).offset();
        newEvent.hostX = ev.pageX - ofs.left;
        newEvent.hostY = ev.pageY - ofs.top;

        block.dispatchEvent(newEvent);
    }
}

$(function () {
    $(".collapser").click(CollapserClick);
    ExpandAll();
});

document.cookie = "DTO=" + (-(new Date().getTimezoneOffset())).toString() + "; path=/; samesite=strict; max-age=316224000";
