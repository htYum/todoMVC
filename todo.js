var $ = function (self) {
	return document.querySelector("." + self);
}
var $all = function (self) {
	return document.querySelectorAll("." + self);
}

var idCnt = 0;
var storage = window.sessionStorage;
var storageItems = {};

function update()
{
	var items = $all("list li");
	var filter = $("filter li a.selected").innerHTML;
	var leftNum = 0;
	
	storageItems = {};
	storageItems["filter"] = filter;
	storageItems["data"] = [];
	for(var i = 0; i < items.length; ++i){
		var item = items[i];
		if(!item.classList.contains("completed"))leftNum++;

		if(filter == "all" || 
			(filter == "active" && !item.classList.contains("completed")) || 
			(filter == "completed" && item.classList.contains("completed"))){
			item.style.display = "block";
		}
		else {
			item.style.display = "none";
		}
		storageItems["data"].push({
			"todo":item.querySelector(".label").innerHTML,
			"completed":item.querySelector(".toggle").checked
		});
	}

	var completedNum = items.length - leftNum;
	var todoCnt = $("todoCnt");
	todoCnt.innerHTML = (leftNum || "no") + (leftNum > 1 ? " items" : " item") + " left";

	var toggle = $("toggleAll");
	toggle.style.visibility = items.length > 0 ? "visible":"hidden";
	toggle.checked = items.length == completedNum;

	var clearCompleted = $("clearCompleted");
	clearCompleted.style.visibility = completedNum > 0 ? "visible" : "hidden";

	storageItems["toggleAll"] = $("toggleAll").checked;
	var jsonData = JSON.stringify(storageItems);
	storage.setItem("todomvc", jsonData);
}

function addTodo(newTodo, completed = false) {
	var list = $("list");

	if (newTodo == "") {
		alert("Input is empty");
		return;
	}

	var item = document.createElement("li");
	var id = "item" + idCnt++;
	item.setAttribute("id", id);
	item.innerHTML = [
		'<div class="view">',
		'<input class="toggle" type="checkbox" style="width: 70px;height: 70px;margin: 0 0 0 5px;">',
		'<label class="label" style="margin:0 0 0 10px;">' + newTodo + '</label>',
		'<button class="delete"></button>',
		'</div>'
	].join("");

	var label = item.querySelector(".label");
	label.addEventListener("click", function () {
		item.classList.add("editing");
		var edit = document.createElement("input");
		var bFinished = false;
		edit.setAttribute("class", "edit");
		edit.setAttribute("type", "text");
		edit.setAttribute("value", label.innerHTML);

		function finish() {
			if (bFinished) return;
			bFinished = true;
			item.removeChild(edit);
			item.classList.remove("editing");
		}

		edit.addEventListener("blur", function () { finish() });
		edit.addEventListener("keyup", function (event) {
			if (event.keyCode == 13){
				label.innerHTML = this.value;
				finish();
			}
		update();
		});
		item.appendChild(edit);
		edit.focus();
	}, false);
	item.querySelector(".toggle").addEventListener("change", function(){
		updateTodo(id, this.checked);
	});
	item.querySelector(".delete").addEventListener("click", function(){
		deleteTodo(id);
	});
	list.insertBefore(item, list.firstChild);
	var toggle = item.querySelector(".toggle");
	if(toggle.checked != completed){
		updateTodo(id, completed);
		toggle.checked = completed;
	}
	update();
}

function toggleAll()
{
	var items = $all("list li");
	var toggle = $("toggleAll");
	var checked = toggle.checked;

	for(var i = 0; i < items.length; ++i){
		var item = items[i];
		if(checked){
			if(!item.classList.contains("completed")){
				item.querySelector(".toggle").checked = checked;
				item.classList.add("completed");
			}
		}
		else{
			if(item.classList.contains("completed")){
				item.querySelector(".toggle").checked = checked;
				item.classList.remove("completed");
			}
		}
	}
	update();
}

function updateTodo(id, completed)
{
	var item = document.querySelector("#" + id);
	if(completed)item.classList.add("completed");
	else item.classList.remove("completed");
	update();
}

function deleteTodo(id)
{
	var list = $("list");
	var item = document.querySelector("#" + id);
	list.removeChild(item);
	update();
}

function clearCompleted()
{
	var list = $("list");
	var items = list.querySelectorAll("li");
	for(var i = 0; i < items.length; ++i){
		var item = items[i];
		if(item.classList.contains("completed")){
			list.removeChild(item);
		}
	}
	update();
}

window.onload = function init(){
	var jsonData = storage.getItem("todomvc");
	storageItems = JSON.parse(jsonData);
	for(var k in storageItems){
		if(k == "filter"){
			var filters = $all("filter li a");
			for(var i = 0; i < filters.length; ++i){
				filters[i].classList.remove("selected");
				if(storageItems[k] == filters[i].innerHTML){
					filters[i].classList.add("selected");
				}
			}
		}
		else if(k == "toggleAll"){
			var toggle = $("toggleAll");
			toggle.checked = storageItems[k];
		}
		else if(k == "data"){
			var temp = storageItems;
			for(var i = temp["data"].length - 1; i >= 0; --i){
				addTodo(temp["data"][i]["todo"], temp["data"][i]["completed"]);
			}
		}
	}

	var input = $("input");
	input.addEventListener("keyup", function(event){
		if(event.keyCode != 13) return;

		var newTodo = input.value;
		if(newTodo == ""){
			alert("input is empty.");
			return;
		}

		addTodo(newTodo);
		input.value = "";
	});

	var clear = $("clearCompleted");
	clear.addEventListener("click", function(){
		clearCompleted();
	});

	var toggle = $("toggleAll");
	toggle.addEventListener("change", function(){
		toggleAll();
	});

	var filters = $all("filter li a");
	for(var i = 0; i < filters.length; ++i){
		(function(filter){
			filter.addEventListener("click", function(){
				for(var j = 0; j < filters.length; ++j){
					filters[j].classList.remove("selected");
				}
				filter.classList.add("selected");
				update();
			});
		})(filters[i])
	}
	update();
}