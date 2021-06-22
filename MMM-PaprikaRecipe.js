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
      if (notification === "DOM_OBJECTS_CREATED") {
        this.getData("FE7402FD-5666-4796-B18C-B5BACD625EA6");
      }
    },

    socketNotificationReceived: function(notification, payload) {
      if (notification == "PAPRIKA_RECIPE_DATA" && payload.instance_id == this.identifier) {
        Log.info(this.name + ": Recieved Recipe Data: " + payload.recipe);
        this.recipe = {
          name: payload.recipe.name,
          ingredient_list: payload.recipe.ingredients.split("\n"),
          directions: payload.recipe.directions.split("\n").filter((str) => /\S/.test(str))
        };

        //this.recipe = recipe;

        MM.getModules().exceptModule(this).enumerate(function(module) {
          module.hide(100);
        });
        this.updateDom();
      }
    }
})
