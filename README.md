# Chicago Lots

Explore vacant City-owned lots in Chicago. Forked from [large-lots](https://github.com/datamade/large-lots).

## Running locally

``` bash
git clone git@github.com:datamade/chicago-lots.git
cd large-lots

# to run locally
python -m SimpleHTTPServer
```

navigate to http://localhost:8000/

# Data

Our map was built using open data from Chicago and Cook County:

* [Chicago - City Owned Land Inventory](https://data.cityofchicago.org/Community-Economic-Development/City-Owned-Land-Inventory/aksk-kvfp)
* [Cook County - 2012 Parcels](https://datacatalog.cookcountyil.gov/GIS-Maps/ccgisdata-Parcel-2012/e62c-6rz8)

# dependencies
We used the following open source tools:

* [PostGIS](http://postgis.net/) - geospatial database
* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs

## Team

* Derek Eder - developer, content
* Eric van Zanten - developer, GIS data merging
* Forest Gregg - process design, content

## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/datamade/chicago-lots/issues

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2014 DataMade. Released under the [MIT License](https://github.com/datamade/chicago-lots/blob/master/LICENSE).
