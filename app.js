//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//covert string into capatilise
const _  = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//connect to mongose
mongoose.connect("mongodb+srv://admin-ratnakar:abhayratnakar@cluster0.czlvk.mongodb.net/todolistDB",{useNewUrlParser: true});

//its prurel iteam schema
const itemsSchema = {
name : String
};
//create database or create model
const Item = mongoose.model("Item", itemsSchema);
//create document or iteam
const item1 = new Item({
name : "welcome"

});
const item2 = new Item({
name : "ratnakar"

});

const item3 = new Item({
name : "abhay"

});

//arr to save data

const defaultItems  = [item1,item2,item3];

const listSchema = {
name: String,
items:[itemsSchema]

};
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find({} , function (err,foundIteams) {
    if(foundIteams.length===0){
//insert many iteam in database
Item.insertMany(defaultItems,function (err) {
  if(err){
    console.log(err);
  }
  else{
console.log("sucess");
  }
});
res.redirect("/");
    }
    else{


      res.render("list", {listTitle: "Today", newListItems: foundIteams});

    }


  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem; 
  const listName = req.body.list;

  const item = new Item({
      name: itemName
  });
 
  if (listName === "Today"){


    item.save();
    res.redirect("/");
  }
else{

List.findOne({name: listName},function (err , foundList) {

  foundList.items.push(item);
  foundList.save();
  res.redirect("/"+ listName);
  
});


}

});
//iteam delete from list

app.post("/delete", function (req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today") {

//find and delet in custom list
    Item.findByIdAndRemove(checkedItemId , function (err) {
      if(!err){
        console.log("sucessfully deleted");
    res.redirect("/");
    
      }
      
    });
  }
  else{
//using mongoose pull and mogoDB find one and update sintex refer video 
List.findOneAndUpdate({name: listName},{$pull : {items: {_id: checkedItemId}}} , function (err , foundList) {

  if(!err){
    res.redirect("/"+ listName);
  }

});

  }

  });

//dynamic rought

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  //find wheather list exist or not

  List.findOne({name:customListName},function (err , foundList) {
  
    if(!err){

      if (!foundList){
    //creating a new list
//dynamic url using express
//new list document
const list  = new List ({
name: customListName,
items: defaultItems
});

list.save();
res.redirect("/"+ customListName);

  }
  else{
//show an existinglist

res.render("list",{listTitle: foundList.name , newListItems: foundList.items});

}
    }
});

});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.Port;
if(port == null || port=="") {
port = 3000;

}
app.listen(port, function(){

  console.log("server is running");
 });