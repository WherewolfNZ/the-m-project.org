# Data Handling (Models / Collections and Stores)
All data handling with models and collections are based on [backbone.js](http://backbonejs.org), so please see their website for all the basics.
 
## M.Model
Extends Backbone.Model for the use of an entity and store.

### Extend 
**M.Model.extend(properties, [classProperties]) **

A Simple example to use a specify your own id and validation (in plain Backbone syntax):

	var MyModel = M.Model.extend({
		idAttribute: '_id',		// default is 'id'
		baseUrl: 'http://my.RestServer.com',
		validate: function(attrs, options) {
			if (!attrs.password) {
				return "Password can not be empty";
    		}
    	}
    });

### Create

In Backbone you would create a new instance of your Model like this:


	var model = new MyModel({		
		firstname: 'Max',
		lastname: 'Mustermann'
	});

Of course you can do this also, but you can also use create:

	var model = MyModel.create({
		firstname: 'Max',
		lastname: 'Mustermann'
	});

### Persistence

All the basics functions of manipulating and persisting Model data are also based on [backbone.js](http://backbonejs.org/#Model).

You can access model attributes using **set** and **get**, but the data will be only changed locally.

	model.set('lastname', 'Wurst'); // this only changes the model

To *store* the data persistent, you can call **save**, this will create new or update changed data dependent on the existence of an id.

	// persist the model data
	model.save({ firstname: 'Hans' },	// here you can change 
										// attributes if needed
		{
			success: function(model) {
			// the model data has been successfully stored
		}
	})

To *load* data you can call **fetch** on the model, this will replace all existing data with the persisted data.

	// reload persisted model data  
	model.fetch({
		success: function(model) {
			// the model data has been successfully loaded
		}
	})

### Using an LocalStorageStore

Backbone calls Backbone.sync to persist data over a REST interface, by default M.Model / M.Collection does this nearly exact in the same way.

But you also have the possibility to set a custom **Store** to override this to override where the data should go and come from.

There are several stores coming with The-M-Project all based on M.Store.

Here is an simple example to store and load data to the local storage of the browser:

	var SimpleModel = M.Model.extend({
    	store: M.LocalStorageStore.create(),
        entity: 'test'
	});
	
	// save existing new data
	SimpleModel.create().save({ 
			firstname: 'My', lastname: 'Test' 
		}, 
		success: function(model) {
			// model.id holds the new created id
		}
	});

Please note you need to the specify an **entity name** to tell the store a collection / table name to store the data to.

Even though this works with a Model, in the most cases you will use a Collection to persist your Models in a Store.

### Specifying fields

You can use an entity to specify foreign field names and types like this:

	var MyModel = M.Model.extend({
		idAttribute: '_id',		// default is 'id'
		entity: {
        	name: 'test',
            fields:  {
				_id: 		{ type: M.CONST.TYPE.STRING, required: YES },
				sureName:	{ name: 'USERNAME', type: M.CONST.TYPE.STRING,  required: YES },
				firstName:	{ type: M.CONST.TYPE.STRING,  length: 200 },
				age:		{ type: M.CONST.TYPE.INTEGER }
			}
		}
	});

In this example the model will transform the attribute name 'sureName' to 'USERNAME' and back while saving and fetching from an REST Server or an other specified store.

## M.Entity

The Entity is used to describe Model attributes in more detail, the specified fields are used to transform names and types to and from a store.

The Entity name is used by is used by the stores all models on the same place.

If only an Entity name is required, you can write it short hand like this:

	var myModel = M.Model.extend({
		entity: 'myEntityName'
	})
	
For a full Entity see the Model sample above.

If Needed you can use an Entity also by its own like this:

	var myEntity = M.Entity.design({  // short version for extend + create
        	name: 'test',
            fields:  {
				_id: 	{ type: M.CONST.TYPE.STRING, required: YES },
				name:	{ name: 'USERNAME', type: M.CONST.TYPE.STRING },
				age:	{ type: M.CONST.TYPE.INTEGER },
				birthday: { type: M.CONST.TYPE.DATE }
			}
	});
	
To transform attributes you can call:	
	
	var data = myEntity.fromAttributes({
	    _id: 1000,
        name: 'Nachname',
        age: '33',
        birthday: '1999-09-23'
    });
    
    console.log(data);
        
`Object {_id: "1000", USERNAME: "Nachname", age: 33, birthday: Moment}`

The reverse way only converts the field name ('USERNAME' to 'name' in this example):

	console.log(
		myEntity.toAttributes(data)
	);
	
`Object {_id: "1000", name: "Nachname", age: 33, birthday: Moment}`

## M.Collection

M.Collections extends [Backbone.Collection](http://backbonejs.org/#Collection) wich holds a set of models and is the usual way to load and save data.

### Create

	var contacts = M.Collection.design({ 	// short for extend + create
		url: 'http://nerds.mway.io:8200/bikini/contacts',	// url to the entity on the rest server
		model: M.Model.extend({				// model prototype used for new records
				idAttribute: 'specialId'	// name of attribute used as id
		})									// (defaults to 'id')
	});

### Fetch

To load all data from the Server:

	contacts.fetch({
		success: function(resp) {
			console.log('fetched ' + resp.length + ' records.');
		}, 
		error: function() {
			console.log('error fetching contacts.');
		}
	});

### Get Models

Get models out of a Collection, for example a few standard Backbone methods:

	var firstModel = contacts.at(0); 		// get the model at index 0
	var referModel = contacts.get('1234'); // get the model with the id '1234'
	
	// iterate ofer all models
	contacts.each(function(model){ 
		// do something with the model
	});
	
	// return an array of all the models in a collection that match the passed attributes.
	var favorites = friends.where({favorit: "X"});

### Select Models

With M.Collection you can also use a [mongoDB query](http://docs.mongodb.org/manual/reference/operator/query/) to select models:

	var specialPeople = contacts.select({
		query: { $or: [ 					// get all contacts where the 
				{ firstname: /^Fr/ },		// firstname starts with 'Fr'
				{ houseno: { $gte: 23 } }  // or the houseno is greater then 23
			]}, 
            sort: ['lastname']				// sorted by lastname
        });

### Create new Model

There are as always more then one way to this, you can add a new model to the collection

	var model = contacts.add({
		firstname: 'New',
		lastname: 'Model'
	});
	
and	persist it later

	model.save();
	
or create and persist the model in one call

	contacts.create({
			firstname: 'New',
			lastname: 'Model'
		},
		success: function(model) {
			// here we the new created and persisted model
			// model.id should be set here
			console.log(model.id);
		}
	});
	
### Using an M.WebSqlStore

If you want to persist your data in an other way then by REST calls, you can provide a custom store.

In the following example the data will be loaded and stored in a WebSql Database of the browser.

	var webSqlStore = M.WebSqlStore.create();
	var people = M.Collection.design({
		store: webSqlStore,
		entity: 'myTable'
	});
	
	people.create({ FirstName: 'Fritz', LastName: 'Meier' },
		success: function(model) {
			// the new created model
		}
	);

In this simple constellation a table named 'myTable' with the two columns 'id' and 'data' will be created, to hold an unique id and the model data as a JSON String.

If you want to use your own or an existing columns you can specify them in an Entity like this:

	var webSqlStore = M.WebSqlStore.design({
		name: 'myDatabase',		// name of the database 
		version: '1.1'			// the version of the db (default '1.0'
	});							// each change of db version will drop all tables!!
	
	var person = M.Model.extend({
		idAttribute: 'MyId',
		entity: {			
			name: 'myTable',
			fields: {
				MyId: { type: M.CONST.TYPE.INTEGER },
				FirstName: { type: M.CONST.TYPE.STRING },
				LastName:  { type: M.CONST.TYPE.STRING }
			}
		}
	});
	
	var people = M.Collection.design({
		store: webSqlStore,
		model: person
	});

	people.create({ // attributes
			FirstName: 'Fritz', LastName: 'Meier'
		},  
		{			// options
			success: function(model) {	
				// the new created model
			}
		}
	);
	
This will create a Database named 'myDatabase', the table 'myTable' with the columns 'MyId', 'FirstName' and 'LastName'.

The Table will only be created if it not already exists, and only the existing columns will be filled with data.
If you need to change the schema of your data, you need to drop the table or alter it by yourself.

To drop the table you can change the version wich will drop all tables in the database or call

	webSqlStore.drop({
		entity: 'myTable'
	});

## M.BikiniStore

Tataahh!! here we come to the coolest store ever ;)

Bikini tries to address the most common synchronization problems you have in a Mobile App, in short you get offline / online synchronization and live updates of your collection.

The use is quiet simple, in the easiest configuration you can use it like this:

	var users = M.Collection.extend({
		model: M.Model.design({ idAttribute: '_id' }),
		url: 'http://nerds.mway.io:8200/bikini/users',
		store: new M.BikiniStore( {
			useLocalStore:   true, // (default) store the data for offline use
		    useSocketNotify: true, // (default) register at the server for live updates
		    useOfflineChanges: true // (default) allow changes to the offline data
		})
	});

Thats it, now you can use it like any other collection.

On **fetch** the changes or initial data will be loaded from the server but reads go always to the local data first (if useLocalStore is not set to false)

All **create** and **save** calls write also first to the local store and then to a log and the server if possible, if not the changes will be sent from the log when the client comes online again.

