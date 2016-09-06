(function () {
	var authLink;
  freeboard.loadDatasourcePlugin({
    type_name: "withings_scale_datasource_plugin",
    display_name: "Withings Scale",
		description: "Use withings scale data to keep track of your health!",
    settings: [
      {
        name: "verified_withings_credentials",
        display_name: "Data credentials",
        type: "text",
        description: "Your data query credentials generated from <a href="+"https://withings-api.herokuapp.com/request-token-url/"+" target='_blank'>here</a>.",
      },
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

		function setRequestUrl(){
			$.ajax({
        url: "https://withings-api.herokuapp.com/scale/",
        dataType: "JSON",
				// replace with actual data
				data:JSON.parse(currentSettings.verified_withings_credentials),
        success: function (data) {
          // data is always returned as an array
					self.requestURL = data; // new data object
        },
        error: function (xhr, status, error) {
        }
      });
		}
		setRequestUrl();

    function getData () {
      $.ajax({
        url: self.requestURL,
				type:"GET",
        dataType: "JSON",
				// replace with actual data
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
		getData();

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
