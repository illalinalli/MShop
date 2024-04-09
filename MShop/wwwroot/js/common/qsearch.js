function QuickSearchEnsureItemVisble(container, item) {
	let ch = container.height();
	let ct = container.scrollTop();
	let ih = item.outerHeight();
	let it = item.position().top;
	if (ch <= ih || it < 0) {
		container.scrollTop(ct + it);
	} else if (it + ih > ch) {
		container.scrollTop(ct + it + ih - ch);
	}
    //console.log("ch: " + ch + " ct: " + ct + " ih: " + ih + " it: " + it);
}

var QuickSearchLastFocused = null;
var QuickSearchAnimationDuration = 0;

function QuickSearchFocusIn(event) { // assigned to button click
	if (QuickSearchLastFocused) QuickSearchFocusOut(QuickSearchLastFocused);
	let ev = jQuery.Event("click", event);
	let target = $(ev.target);
	//setTimeout(() => {
	let block = target.closest(".qs_block");
	target.hide();
	block.find(".qs_input").show().focus().select();
	block.find(".qs_itemsContainer").scrollTop(0).slideDown(QuickSearchAnimationDuration);
	QuickSearchLastFocused = block;
	QuickSearchLoadData(block);
	//}, 100);
}

function QuickSearchFocusOut(block) {
	block.find(".qs_button").show();//.focus();
	block.find(".qs_input").hide();
	block.find(".qs_itemsContainer").slideUp(QuickSearchAnimationDuration).scrollTop(0).html("");
	QuickSearchLastFocused = null;
}

function QuickSearchConfirmItem(item) { // item: jQueryElement
	let block = item.closest(".qs_block");
	let title = item.data("title");
	block.find(".qs_hidden").val(item.data("id"));
	block.find(".qs_input").val(title);
	block.find(".qs_button").addClass("qs_is_selected");
	let complexTitle = item.data("complexTitle"); if (complexTitle) title = complexTitle;
    block.find(".qs_button_text").removeClass("hidden").html(title);
    block.find(".qs_button_dots").addClass("hidden");
	QuickSearchFocusOut(block);
	eventFire(block[0], 'volumechange');
	eventFire(block.find(".qs_hidden")[0], 'change');
}

function QuickSearchSetNull(block) {
	block.find(".qs_hidden").val("000000000000000000000000");
	block.find(".qs_input").val("");
	block.find(".qs_button").removeClass("qs_is_selected");//.html("<span class='bi bi-three-dots'></span>");
    block.find(".qs_button_dots").removeClass("hidden");
    block.find(".qs_button_text").addClass("hidden");
	QuickSearchFocusOut(block);
	eventFire(block[0], 'volumechange');
	eventFire(block.find(".qs_hidden")[0], 'change');
}

function QuickSearchSetNullButtonClick(event) {
	let ev = jQuery.Event("click", event);
	let target = $(ev.target);
	let block = target.closest(".qs_block");
	QuickSearchSetNull(block);
}

function QuickSearchItemClick(event) {
	let ev = jQuery.Event("click", event);
	let target = $(ev.target).closest(".qs_item");
	if (target.length) {
		QuickSearchConfirmItem(target);
	}
}

function QuickSearchInputKeydown(event) {
	let result = true;
	let ev = jQuery.Event("keydown", event);
	let target = $(ev.target);
	let block = target.closest(".qs_block");
	let itemsContainer = block.find(".qs_itemsContainer");
	let allVisible = itemsContainer.children(".qs_item:visible");
	let selectedItem = allVisible.filter(".selected");
	let currentIndex = allVisible.index(selectedItem);

	if (ev.key === "ArrowDown") {
		if (!allVisible.length) return result;
		if (selectedItem.length) {
			if (currentIndex >= allVisible.length - 1) currentIndex = -1;
			selectedItem.removeClass("selected");
			selectedItem = allVisible.eq(currentIndex + 1);
		} else {
			selectedItem = allVisible.eq(0);
		}

		selectedItem.addClass("selected");
		QuickSearchEnsureItemVisble(itemsContainer, selectedItem);
		target.val(selectedItem.data("title"));
		return result;
	}

	if (ev.key === "ArrowUp") {
		if (!allVisible.length) return result;
		if (selectedItem.length) {
			if (currentIndex <= 0) currentIndex = allVisible.length;
			selectedItem.removeClass("selected");
			selectedItem = allVisible.eq(currentIndex - 1);
		} else {
			selectedItem = allVisible.eq(allVisible.length - 1);
		}

		selectedItem.addClass("selected");
		QuickSearchEnsureItemVisble(itemsContainer, selectedItem);
		target.val(selectedItem.data("title"));
		return result;
	}

	if (ev.key === "Enter" || ev.key === "Tab") {
		if (ev.key === "Enter") result = false;
		if (selectedItem.length) {
			selectedItem.removeClass("selected");
			QuickSearchConfirmItem(selectedItem);
		} else
			if (allVisible.length === 1) {
				QuickSearchConfirmItem(allVisible.eq(0));
			} else {
				QuickSearchFocusOut(block);
			}
		return result;
	}

	if (ev.key === "Escape") {
		selectedItem.removeClass("selected");
		QuickSearchFocusOut(block);
	}
	return result;
}

function QuickSearchLoadData(block) {
	let data = {
		what: block.data("function"),
		filter: block.data("filter"),
		search: block.find(".qs_input").val()
	};
	$.ajax("/ru/Helper/GetListOf", {
		method: "POST",
		data: data,
		success: function (html) {
			block.find(".qs_itemsContainer").html(html);
		}
	});
}

function QuickSearchInputInput(event) {
	let ev = jQuery.Event("input", event);
	let target = $(ev.target);
	let block = target.closest(".qs_block");
	QuickSearchLoadData(block);
}


/// Bla

var BlaQuickSearchOpen = [];

function BlaDispatchItemSelected(block, value)
{
    var newEvent = new Event("qsearchitemselected", { bubbles: true });
    newEvent.itemId = value;
    if (typeof block.length === "number") block = block[0];
    block.dispatchEvent(newEvent);
}

function BlaQuickSearchPush(block)
{
    BlaQuickSearchOpen.push(block);
}

function BlaQuickSearchCloseAll() {
    let l = BlaQuickSearchOpen.length;
    if (l > 0) {
        for (let i = 0; i < l; i++) {
            let block = BlaQuickSearchOpen[i];
            BlaDispatchItemSelected(block, "");
        }
        BlaQuickSearchOpen = [];
    }
}

function BlaQuickSearchItemClick(event) {
	let ev = jQuery.Event("click", event);
	let target = $(ev.target).closest(".qs_item");
	if (target.length) {
        BlaDispatchItemSelected(event.currentTarget, target.data("id"));
	}
}

function BlaQuickSearchInputKeydown(event) {
	let result = true;
	let ev = jQuery.Event("keydown", event);
	let target = $(ev.target);
	let block = target.closest(".qs_block");
	let itemsContainer = block.find(".qs_itemsContainer");
	let allVisible = itemsContainer.children(".qs_item:visible");
	let selectedItem = allVisible.filter(".selected");
	let currentIndex = allVisible.index(selectedItem);

	if (ev.key === "ArrowDown") {
		if (!allVisible.length) return result;
		if (selectedItem.length) {
			if (currentIndex >= allVisible.length - 1) currentIndex = -1;
			selectedItem.removeClass("selected");
			selectedItem = allVisible.eq(currentIndex + 1);
		} else {
			selectedItem = allVisible.eq(0);
		}

		selectedItem.addClass("selected");
		QuickSearchEnsureItemVisble(itemsContainer, selectedItem);
		//target.val(selectedItem.data("title"));
		return result;
	}

	if (ev.key === "ArrowUp") {
		if (!allVisible.length) return result;
		if (selectedItem.length) {
			if (currentIndex <= 0) currentIndex = allVisible.length;
			selectedItem.removeClass("selected");
			selectedItem = allVisible.eq(currentIndex - 1);
		} else {
			selectedItem = allVisible.eq(allVisible.length - 1);
		}

		selectedItem.addClass("selected");
		QuickSearchEnsureItemVisble(itemsContainer, selectedItem);
		//target.val(selectedItem.data("title"));
		return result;
	}

	if (ev.key === "Enter" || ev.key === "Tab") {
		if (ev.key === "Enter") result = false;

		if (selectedItem.length) {
			selectedItem.removeClass("selected");
            BlaDispatchItemSelected(block, selectedItem.data("id"));
		} else
			if (allVisible.length === 1) {
                BlaDispatchItemSelected(block, allVisible.eq(0).data("id"));
			} else {
				BlaDispatchItemSelected(block, "");
			}
		return result;
	}

	if (ev.key === "Escape") {
		selectedItem.removeClass("selected");
		BlaDispatchItemSelected(block, "");
	}

	return result;
}

/// Rest

$(function () {
	$(document)
    .on("mouseup", function (ev) {
        if (ev.which == 1) {
            BlaQuickSearchCloseAll();

		    if (!QuickSearchLastFocused) return;

		    if (!QuickSearchLastFocused.has(ev.target).length) {
			    QuickSearchFocusOut(QuickSearchLastFocused);
		    }
        }
	})
    .on("keydown", function (ev) {
        if (ev.key === "F8") {
            $("#barcodeCapturer").val("").focus();
        }
    });
});