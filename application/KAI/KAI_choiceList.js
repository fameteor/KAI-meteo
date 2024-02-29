// -----------------------------------------------------------------
// KAI.choiceList
// -----------------------------------------------------------------

KAI.choiceList = function(list,options) {
	this.options = options;
	this.list = list;
	this.currentIndex = (this.options && this.options.initialSelectionIndex) ? this.options.initialSelectionIndex() : 0;
}

KAI.choiceList.prototype.verticalScrollToActiveElement = function() {
	if ($("tr[id^=" + this.options.selectedItemIdPrefix + "].active") && $("tr[id^=" + this.options.selectedItemIdPrefix + "].active").position()) document.getElementById("dictionnariesListSelector").scrollTo({top: $("tr[id^=" + this.options.selectedItemIdPrefix + "].active").position().top, behavior: 'smooth'});
	// Other possibiity :
	// document.getElementById("root").scrollTo({top: this.currentIndex * 70, behavior: 'smooth'});
}

KAI.choiceList.prototype.refreshSelection = function() {
	// Refresh selection
	if (this.options.selectedItemIdPrefix) {
		const that = this;
		this.list.forEach(function(item,index) {
			if (index === that.currentIndex) 	$("#" +  that.options.selectedItemIdPrefix + index).addClass("active");
			else								$("#" +  that.options.selectedItemIdPrefix + index).removeClass("active");
		});
	}
	// Refresh accordingly hide/show
	if (this.options.showDomElementPrefix) {
		const that = this;
		this.list.forEach(function(item,index) {
			if (index === that.currentIndex) 	$(that.options.showDomElementPrefix + index).show();
			else								$(that.options.showDomElementPrefix + index).hide();
		});
	}
	this.verticalScrollToActiveElement();
};

KAI.choiceList.prototype.currentItem = function() {
	return this.list[this.currentIndex];
};

KAI.choiceList.prototype.next = function() {
	if (this.currentIndex < this.list.length - 1) 	this.currentIndex += 1;
	else 											this.currentIndex = 0;
	this.refreshSelection();
};

KAI.choiceList.prototype.previous = function() {
	if (this.currentIndex != 0) this.currentIndex -= 1;
	else 						this.currentIndex = this.list.length - 1;
	this.refreshSelection();
};

KAI.choiceList.prototype.generateHtml = function() {
	this.refreshHTML();
	this.refreshSelection();
};

// -----------------------------------------------------------------
// refreshHTML
// -----------------------------------------------------------------
KAI.choiceList.prototype.refreshHTML = function() {
	// Template ------------------------------------------------------
	const template = `
		<table>
			{{#.}}
				<tr id="{{id}}" class="list">
					<td class="list">
						{{#choiceList_icon}}
								<label><i class="{{choiceList_icon}}"></i></label>
							<br/>
						{{/choiceList_icon}}
						{{#choiceList_itemNumbered}}
							<span class="info">{{choiceList_itemNumber}}</span>
						{{/choiceList_itemNumbered}}
					</td>
					<td class="list">
						<center>
							<choiceList_label>{{{choiceList_label}}}</choiceList_label>
							{{#choiceList_infos}}
								<div class="info">{{{choiceList_infos}}}</div>
							{{/choiceList_infos}}
						</center>
					</td>
					<td class="text-center list">
						{{#choiceList_typeIsBOOLEAN}}
							{{#choiceList_value}}
								<input type="checkbox" checked>
							{{/choiceList_value}}
							{{^choiceList_value}}
								<input type="checkbox">
							{{/choiceList_value}}
						{{/choiceList_typeIsBOOLEAN}}
						{{#choiceList_typeIsMENU}}
							<i class="fas fa-chevron-right"></i>
						{{/choiceList_typeIsMENU}}
					</td>
				</tr>
			{{/.}}
		</table>
	`;
	// data creation -------------------------------------------------
	that = this;
	const data = this.list.map(function(element,index) {
		let newElement = {};
		newElement.id = that.options.selectedItemIdPrefix + index;
		newElement.choiceList_label = (element.choiceList_label instanceof Function) ? element.choiceList_label() : element.choiceList_label;
		newElement.choiceList_icon = element.choiceList_icon;
		newElement.choiceList_type = element.choiceList_type;
		newElement.choiceList_value = element.choiceList_value;
		newElement.choiceList_infos = (element.choiceList_infos instanceof Function) ? element.choiceList_infos() : element.choiceList_infos;
		newElement.choiceList_typeIsBOOLEAN = (element.choiceList_type === "BOOLEAN");
		newElement.choiceList_typeIsMENU = (element.choiceList_type === "MENU");
		newElement.choiceList_typeIsNONE = (element.choiceList_type === "NONE");
		if (element.choiceList_itemNumbered) {
			if (element.choiceList_itemNumbered === "UP") {
				newElement.choiceList_itemNumbered = element.choiceList_itemNumbered;
				newElement.choiceList_itemNumber = index + 1;
			}
			if (element.choiceList_itemNumbered === "DOWN") {
				newElement.choiceList_itemNumbered = element.choiceList_itemNumbered;
				newElement.choiceList_itemNumber = that.list.length - index;
			}
		}
		return newElement;
	});
	console.log(data);
	// Rendering -----------------------------------------------------
	$(this.options.targetDomSelector).html(mustache.render(template,data));
}

console.log("KAI.choiceList.js loaded");
