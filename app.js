const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', true);

const app = express();

let items = ["Buy food", "Cook food", "Eat food"];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-ryan:test123@cluster0.nhpsnfu.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Add some items!"});
const item2 = new Item({ name: "Write at the bottom"});
const item3 = new Item({ name: "Hit the plus"});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items to DB.");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newItems: foundItems, pageName: "/"});
        }
    });

});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/modify", (req, res) => {
    res.redirect("/");
});

app.get("/:page", (req, res) => {

    const pageName = _.capitalize(req.params.page);

    List.findOne({name: pageName}, (err, listPage) => {
        if (listPage != null) {

            if (listPage.items.length === 0) {

                listPage.items = defaultItems;
                listPage.save();
            } 

            res.render("list", {listTitle: listPage.name, newItems: listPage.items, pageName: "/"+pageName});
        
        } else {
            
            const list = new List({
                name: pageName,
                items: defaultItems
            });
        
            list.save();
            res.redirect("/"+pageName);
        }
    });
    
    
});

app.post("/", (req, res) => {

    const item = new Item({name: req.body.newItem});
    const listName = req.body.button;

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }  

});

app.post("/delete", (req, res) => {
    
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.find({_id: req.body.checkbox}).remove().exec();
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: req.body.checkbox}}}, (err, foundList) => {});
        res.redirect("/"+listName);
    }
    
});


app.listen(3000, function() {
    console.log("Server started on part 3000");
});