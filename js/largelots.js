var LargeLots = LargeLots || {};
var LargeLots = {

  map: null,
  map_centroid: [41.8781136, -87.66677856445312],
  defaultZoom: 11,
  lastClickedLayer: null,
  geojson: null,
  marker: null,
  locationScope: 'Chicago',
  boundaryCartocss: '#large_lot_boundary{polygon-fill: #ffffbf;polygon-opacity: 0.1;line-color: #FFF;line-width: 3;line-opacity: 1;}',
  parcelsCartocss: $('#chicago-lots-styles').html().trim(),
  boundingBox: {
    'bottom': 42.023134979999995,
    'top': 41.644286009999995,
    'right': -87.52366115999999,
    'left': -87.94010087999999
  },

  initialize: function() {

      if (!LargeLots.map) {
        LargeLots.map = L.map('map', {
          center: LargeLots.map_centroid,
          zoom: LargeLots.defaultZoom,
          scrollWheelZoom: false
        });
      }
      // render a map!
      L.Icon.Default.imagePath = '/images/'

      LargeLots.streets = L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        detectRetina: true
      });

      LargeLots.satellite = L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.k92mcmc8/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        detectRetina: true
      });

      LargeLots.buildings = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        detectRetina: true
      });

      LargeLots.baseMaps = {"Streets": LargeLots.streets, "Building addresses": LargeLots.buildings, "Satellite": LargeLots.satellite};
      LargeLots.streets.addTo(LargeLots.map);
      
      LargeLots.info = L.control({position: 'bottomright'});

      LargeLots.info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          this.update();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      LargeLots.info.update = function (props) {
        var date_formatted = '';
        if (props) {
          var info = "<h4>" + LargeLots.formatAddress(props) + "</h4>";
          info += "<p>PIN: " + props.pin14 + "<br />";
          info += "Zoned: " + props.zoning_classification + "<br />";
          info += "Sq Ft: " + props.sq_ft + "<br />";

          this._div.innerHTML  = info;
        }
      };

      LargeLots.info.clear = function(){
          this._div.innerHTML = '';
      }

      LargeLots.info.addTo(LargeLots.map);

      var fields = "pin14,zoning_classification,ward,street_name,dir,street_number,type,sq_ft"
      var cartocss = $('#chicago-lots-styles').html().trim();
      var layerOpts = {
          user_name: 'datamade',
          type: 'cartodb',
          sublayers: [{
                  sql: "SELECT * FROM chicago_land_inventory",
                  cartocss: LargeLots.parcelsCartocss,
                  interactivity: fields
              },
              {
                  sql: 'select * from chicago_city_boundary',
                  cartocss: LargeLots.boundaryCartocss
              }]
      }
      cartodb.createLayer(LargeLots.map, layerOpts)
        .addTo(LargeLots.map)
        .done(function(layer) {

            // after layer is loaded, add the layer toggle control
            L.control.layers(LargeLots.baseMaps, {"City-owned parcels": layer}, { collapsed: false, autoZIndex: true }).addTo(LargeLots.map);

            var sublayer = layer.getSubLayer(0)
            sublayer.setInteraction(true);
            sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
              $('#map div').css('cursor','pointer');
              LargeLots.info.update(data);
            });
            sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
              $('#map div').css('cursor','inherit');
              LargeLots.info.clear();
            });
            sublayer.on('featureClick', function(e, pos, latlng, data){
                LargeLots.getOneParcel(data['pin14']);
            });
            window.setTimeout(function(){
                if($.address.parameter('pin')){
                    LargeLots.getOneParcel($.address.parameter('pin'))
                }
            }, 1000)
        }).error(function(e) {
        //console.log('ERROR')
        //console.log(e)
      });

      
      var legend = L.control({position: 'bottomleft'});
      legend.onAdd = function (map) {

           var div = L.DomUtil.create('div', 'info legend')

           div.innerHTML = '\
           <h4>Zoning</h4>\
           <i style="background:#41ab5d"></i> Residential<br />\
           <i style="background:#6baed6"></i> Commercial<br />\
           <i style="background:#DCDC7F"></i> Industrial<br />\
           <i style="background:#cccccc"></i> Other';
           return div;
       };

       legend.addTo(LargeLots.map);

      $("#search_address").val(LargeLots.convertToPlainString($.address.parameter('address')));
      LargeLots.addressSearch();
  },

  checkZone: function (ZONING_CLA, value) {
    if (ZONING_CLA.indexOf(value) != -1)
      return true;
    else
      return false;
  },

  formatAddress: function (prop) {
    return prop.street_number + " " + prop.dir + " " + prop.street_name + " " + prop.type;
  },

  getOneParcel: function(pin14){
      if (LargeLots.lastClickedLayer){
        LargeLots.map.removeLayer(LargeLots.lastClickedLayer);
      }
      var sql = new cartodb.SQL({user: 'datamade', format: 'geojson'});
      sql.execute('select * from chicago_land_inventory where pin14 = {{pin14}}', {pin14:pin14})
        .done(function(data){
            var shape = data.features[0];
            LargeLots.lastClickedLayer = L.geoJson(shape);
            LargeLots.lastClickedLayer.addTo(LargeLots.map);
            LargeLots.lastClickedLayer.setStyle({weight: 2, fillOpacity: 0, color: '#000'});
            LargeLots.map.setView(LargeLots.lastClickedLayer.getBounds().getCenter(), 17);
            LargeLots.selectParcel(shape.properties);
        });
  },

  selectParcel: function (props){
      var address = LargeLots.formatAddress(props);
      var zoning = LargeLots.simplifyZoning(props.zoning_classification);
      var info = "<p>Selected lot: </p><img class='img-responsive img-thumbnail' src='http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?" + props.pin14 + "=' />\
        <table class='table table-bordered table-condensed'><tbody>\
          <tr><td>Address</td><td>" + address + "</td></tr>\
          <tr><td>PIN</td><td>" + props.pin14 + "</td></tr>\
          <tr><td>&nbsp;</td><td><a target='_blank' href='http://cookcountypropertyinfo.com/Pages/PIN-Results.aspx?PIN=" + props.pin14 + "'>Tax and deed history &raquo;</a></td></tr>\
          <tr><td>Zoned</td><td><a href='http://secondcityzoning.org/zone/" + zoning + "' target='_blank'>" + zoning + "</a></td></tr>\
          <tr><td>Sq ft</td><td>" + LargeLots.addCommas(props.sq_ft) + "</td></tr>\
        </tbody></table>";
      $.address.parameter('pin', props.pin14)
      $('#lot-info').html(info);
  },


  simplifyZoning: function(zone_class){
    if (zone_class.substring(0, 'PMD'.length) === 'PMD') {
      return "PMD";
    }

    if (zone_class.substring(0, 'PD'.length) === 'PD') {
      return "PD";
    }

    return zone_class;
  },

  addressSearch: function (e) {
    if (e) e.preventDefault();
    var searchRadius = $("#search_address").val();
    if (searchRadius != '') {

      var raw_address = $("#search_address").val().toLowerCase();
      raw_address = raw_address.replace(" n ", " north ");
      raw_address = raw_address.replace(" s ", " south ");
      raw_address = raw_address.replace(" e ", " east ");
      raw_address = raw_address.replace(" w ", " west ");

      if(LargeLots.locationScope && LargeLots.locationScope.length){
        var checkaddress = raw_address.toLowerCase();
        var checkcity = LargeLots.locationScope.split(",")[0].toLowerCase();
        if(checkaddress.indexOf(checkcity) == -1){
          raw_address += ", " + LargeLots.locationScope;
        }
      }

      $.address.parameter('address', encodeURIComponent(raw_address));

      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = "http://nominatim.openstreetmap.org/search/" + encodeURIComponent(raw_address) + "?format=json&bounded=1&viewbox=" + LargeLots.boundingBox['left'] + "," + LargeLots.boundingBox['top'] + "," + LargeLots.boundingBox['right'] + "," + LargeLots.boundingBox['bottom'] + "&json_callback=LargeLots.returnAddress";
      document.body.appendChild(s);
      //&bounded=1&viewbox=" + LargeLots.boundingBox['left'] + "," + LargeLots.boundingBox['top'] + "," + LargeLots.boundingBox['right'] + "," + LargeLots.boundingBox['bottom'] + "
    }
  },

  returnAddress: function (response){

    if(!response.length){
      $('#modalGeocode').modal('show');
      return;
    }

    var first = response[0];

    LargeLots.map.setView([first.lat, first.lon], 17);

    if (LargeLots.marker)
      LargeLots.map.removeLayer( LargeLots.marker );

    var defaultIcon = L.icon({
        iconUrl: 'images/marker-icon.png',
        shadowUrl: 'images/marker-shadow.png',
        shadowAnchor: [0, 0]
      });
    LargeLots.marker = L.marker([first.lat, first.lon]).addTo(LargeLots.map);
  },

  addCommas: function(nStr) {
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    },

  //converts a slug or query string in to readable text
  convertToPlainString: function (text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  }

}
