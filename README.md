# flight patterns

We selected 10 random days in 2018 and downloaded the global aircraft transponder data from [ADS-B Exchange](https://www.adsbexchange.com).

Based on the data quality we selected 37 airports, extracted the 2000 best flight routes above these airports and converted them to [binary files](https://github.com/michaelkreil/flightdata-client/tree/master/web/assets/data/airports).

The `web` folder contains all JavaScript code to visualize these flight routes with WebGL (three.js).

`build` contains a small build script to prepare and deploy the web application. You can also run `./build.sh`

**You can play around with the data at [michaelkreil.github.io/flightdata-client/](https://michaelkreil.github.io/flightdata-client/)**

<div style="text-align:center">
	<a href="https://michaelkreil.github.io/flightdata-client/"><img src="https://michaelkreil.github.io/flightdata-client/assets/images/twittercard.png" width="100%"></a>
</div>
