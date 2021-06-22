var NodeHelper = require("node_helper");
var PaprikaAPI = require("paprika-api");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node_helper for module [" + this.name + "]");
    this.paprikaAPI = null;
    this.outstandingRequest = false;
  },
  /// "GET_PAPRIKA_RECIPE" - Payload: { email: string, password: string, recipe_uid: string }
  socketNotificationReceived: function(notification, payload) {
    console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);

    if (notification === "GET_PAPRIKA_RECIPE") {
      if (payload.email == null || payload.email == "") {
        console.log(this.name + " *** ERROR *** No email set for PaprikaRecipe.");
      } else if (payload.password == null || payload.password == "") {
        console.log(this.name + " *** ERROR *** No password set for PaprikaRecipe.");
      } else if (payload.recipe_uid == null || payload.recipe_uid == "") {
        console.log(this.name + " *** ERROR *** No recipe UID for PaprikaRecipe.");
      } else {
        if (this.paprikaAPI == null) {
          this.paprikaAPI = new PaprikaAPI.PaprikaApi(payload.email, payload.password);
        }

        console.log(this.name + ": Fetching recipe with UID - " + payload.recipe_uid);
        
        var self = this;

        this.paprikaAPI.recipe(payload.recipe_uid)
          .then(function(recipe) {
            resp = {
              instance_id: payload.instance_id,
              recipe: recipe
            };
            console.log(self.name + ": Recieved Recipe Data");
            console.log(self.name + ": Recipe Name: " + recipe.name);
            console.log(self.name + ": Recipe Ingredients: " + recipe.ingredients);
            console.log(self.name + ": Recipe Directions: " + recipe.directions);
            self.sendSocketNotification("PAPRIKA_RECIPE_DATA", resp);
          });
      }
    }
  }
});
