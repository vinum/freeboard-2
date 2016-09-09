(function () {
	var authLink;
  freeboard.loadDatasourcePlugin({
    type_name: "withings_scale_datasource_plugin",
    display_name: "Withings Scale",
		description: "Use withings scale data to keep track of your health!",
    settings: [
      {
        name: "verified_withings_url",
        display_name: "Data URl",
        type: "text",
        description: "Your data url generated from <a href="+"https://withings-api.herokuapp.com/request-token-url/"+" target='_blank'>here</a>.",
      },
			//The request-token-url launches an oauth flow within the herokuapp,
			// the user signs in and then I set the callback to return the credentials
			// which the heroku app uses to generate the link that needs to be pinged in getData
      {
        name: "refresh",
        display_name: "Refresh Every",
        type: "number",
        suffix: "seconds",
        default_value: 30
      }
    ],
    newInstance: function (settings, newInstanceCallback, updateCallback) {
      newInstanceCallback(new withingsDatasource(settings, updateCallback));
    }
  });

  var withingsDatasource = function (settings, updateCallback) {
    var self = this,
        refreshTimer,
        currentSettings = settings;

    function getData () {
      $.ajax({
        url: currentSettings.verified_withings_url,
				type:"GET",
        dataType: "JSON",
        success: function (data) {
          // data is always returned as an array
					var dataObj = data.body.measuregrps[0].measures[0];
					data = dataObj.value * Math.pow(10, dataObj.unit);
					var newData = data; // weight in kg
          updateCallback(newData);
        },
        error: function (xhr, status, error) {
        }
      });
    }

    function createRefreshTimer (interval) {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }

      refreshTimer = setInterval(function () {
        getData();
      }, interval);
    }

    createRefreshTimer(currentSettings.refresh * 1000);

    self.onSettingsChanged = function (newSettings) {
      currentSettings = newSettings;
    };

    self.updateNow = function () {
      getData();
    };

    self.onDispose = function () {
      clearInterval(refreshTimer);
      refreshTimer = undefined;
    };

  };
}());
