Module.register("MMM-PaprikaRecipe", {
    /*
    This module uses the Nunjucks templating system introduced in
    version 2.2.0 of MagicMirror.  If you're seeing nothing on your
    display where you expect this module to appear, make sure your
    MagicMirror version is at least 2.2.0.
    */
    requiresVersion: "2.2.0",

    defaults: {
      email: "",
      password: ""
    },

    getStyles: function() {
      return ["MMM-PaprikaRecipe.css"];
    },

    getTemplate: function() {
      return "MMM-PaprikaRecipe.njk";
    },

    getTemplateData: function() {
      return {
        loading: this.recipe == null ? true : false,
        recipe: this.recipe
      };
    },

    start: function() {
      Log.info("Starting module: " + this.name);

      this.recipe = null;
    },

    getData: function(recipeUID) {
      this.sendSocketNotification("GET_PAPRIKA_RECIPE", {
        instance_id: this.identifier,
        email: this.config.email,
        password: this.config.password,
        recipe_uid: recipeUID
      });
    },

    notificationReceived: function(notification, payload, sender) {
      Log.info(this.name + ": Recieved Notification: " + notification);
      var self = this;
      if (notification === "DOM_OBJECTS_CREATED") {
        Log.info(this.name + ": Hiding on startup");
        this.hide();

        //this.sendNotification("PAPRIKA_SHOW_RECIPE_DETAILS", { recipe_uid: "FE7402FD-5666-4796-B18C-B5BACD625EA6" });
        //this.notificationReceived("PAPRIKA_SHOW_RECIPE_DETAILS", { recipe_uid: "FE7402FD-5666-4796-B18C-B5BACD625EA6" }, this);
      } else if (notification === "PAPRIKA_SHOW_RECIPE_DETAILS") {
        if (payload.recipe_uid == null || payload.recipe_uid == "") {
          Log.error(this.name + ": PAPRIKA_SHOW_RECIPE_DETAILS - No recipe UID provided");
          return;
        }

        if (this.hidden == true) {
          MM.getModules().exceptModule(this).enumerate(function(module) {
            module.hide(500);
          });
          this.show(500);
        }

        this.getData(payload.recipe_uid);
      } else if (notification === "PAPRIKA_DISMISS_RECIPE_DETAILS") {
        if (this.hidden == true) {
          Log.warn(this.name + ": PAPRIKA_DISMISS_RECIPE_DETAILS - Recipe is already dismissed");
          return;
        } else {
          this.hide(500, function() {
            self.recipe = null;
            self.updateDom();
          });
          MM.getModules().exceptModule(this).enumerate(function(module) {
            module.show(500);
          });
        }
      }
    },

    socketNotificationReceived: function(notification, payload) {
      if (notification == "PAPRIKA_RECIPE_DATA" && payload.instance_id == this.identifier) {
        Log.info(this.name + ": Recieved Recipe Data:");
        Log.info(payload.recipe);
        this.recipe = {
          name: payload.recipe.name,
          photo_url: payload.recipe.photo_url,
          ingredient_list: payload.recipe.ingredients.split("\n"),
          directions: payload.recipe.directions.split("\n").filter((str) => /\S/.test(str))
        };

        Log.info(this.name + ": Photo URL: " + payload.recipe.photo_url);

        this.updateDom(500);
      }
    }
})
