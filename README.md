# Full-Stack Engineering Test

- [Background](#background)
- [Assignment](#assignment)
- [Feature List](#feature-list)
- [Setup](#setup)
- [API Specification](#api-specification)
- [Submission Instructions](#submission-instructions)
- [Scoring](#scoring)

## Background

Full-stack engineers at Zesty.ai develop our web applications end-to-end, working with modern front-end frameworks, APIs (ours and third parties'), and many kinds of data and imagery.

This test is an opportunity for you to demonstrate your comfort with developing UI and API services, similar to a day-to-day project you might encounter working on our team.


## Assignment

Your goal is to create a full-stack web application that allows users to search for and retrieve information about real estate properties (see [Feature List](#feature-list)). Using your language(s) and framework(s) of choice, you will need to create a front-end and back-end (see [API Specification](#api-specification)) for your application and connect to the provided PostgreSQL database (see [Setup](#setup)). Your UI and API should both be packaged as containerized services (Docker images).

Note that some features are more difficult than others, and you will be evaluated on more than just the number of
features completed. Quality is preferred over quantity. Design, organize, and comment your code as you would a typical 
production project. Be prepared to discuss decisions you made.

## Feature List

* **List all properties:** Display, in a tabular format, all properties and their geographic location (longitude and 
  latitude).
  
* **Property detail page:** Show detailed information about a given property, including its image and geographic location.

* **Search by coordinates:** Prompt the user for a longitude, latitude, and search radius (default 10000 meters) and 
  display, in a tabular format, the results of the search, including the properties' geographic location (longitude and 
  latitude).

* **Image overlays:** Add polygonal overlays to property images to represent either the parcel, building, or both 
  (`parcel_geo` and `buildings_geo` fields in the database).

* **Containerization:** Include Docker image(s) of your application when submitting your final code.

## Setup

### Development environment requirements
You will need to install [Docker](https://www.docker.com/products/docker-desktop) and 
[`docker-compose`](https://docs.docker.com/compose/install/) to run the example database.

### Database startup
From the repo root folder, run `docker-compose up -d` to start the PostgreSQL database needed for this example. The 
database server will be exposed on port **5555**. If this port is not available on your computer, feel free to change 
the port in the `docker-compose.yml` file.

In the test database, there is a single table called `properties` (with 5 sample rows), where each row represents a 
property or address. There are three geography<sup>*</sup> fields and one field with an image URL pointing to an image on [Google Cloud Storage](https://cloud.google.com/storage/).

<sup>*</sup> *If you are not familiar with [PostgreSQL](https://www.postgresql.org/) or [PostGIS](https://postgis.net/), you may need to read up beforehand.*

## API Specification
The API you will be implementing for this project must adhere to the following API specification:

***

### GET /properties
*Lists all properties.*

`example: GET localhost:1235/properties`

##### Response
JSON array of property objects

***

### POST /find
*Finds properties within X meters away from provided geojson point.*

`example: POST localhost:1235/find`

##### Request Body
- geojson object with x-distance property

```
example:

{
  "type": "Feature",
  "geometry": {
  "type": "Point",
  "coordinates": [-80.0782213, 26.8849731]
  },
  "x-distance": 1755000
}
```

##### Response
JSON array of property IDs

***

### GET /display/:id?(overlay=yes(&parcel=:parcelColor)(&building=:buildingColor))

*Fetches and displays property tile by ID. Optionally overlays parcel and building geometries on tile.*

`example: GET localhost:1235/display/f853874999424ad2a5b6f37af6b56610?overlay=yes&building=green&parcel=orange`

##### Request Parameters
- "id" | description: Property ID | type: string | required: true | validation: length greater than 0

- "overlay" | description: Overlays parcel and building geometries on tile | type: string | required: false | validation: enum("yes")

- "parcel" | description: Indicated building overlay color | type: string | required: false | validation: enum() ex. "red", "green", "orange"

- "building" | description: Indicates building overlay color | type: string | required: false | validation: enum() ex. "red", "green", "orange"

##### Response
JPEG image

## Submission instructions

Send us your completed application's code by email, or create and give us access to a new private GitHub repository.

Include instructions on how to run your app, and a list of what features you implemented. Add any comments or things you 
want the reviewer to consider when looking at your submission. You don't need to be too detailed, as there will likely 
be a review done with you where you can explain what you've done.

## Scoring

Your submission will be scored out of 100 using the following scorecard:

|      **Feature**      | **Max score** |
|:---------------------:|:-------------:|
|  List all properties  |      15       |
|  Property detail page |      15       |
| Search by coordinates |      20       |
|     Image overlays    |      20       |
|    Containerization   |      10       |
|         Extras        |      20       |
|       **Total**       |    **100**    |

Note that the points attributed to each feature are not all-or-nothing. Partial points will be attributed for incomplete
features. If you can't complete a feature, you're still encouraged to submit code that shows signs of your progress. 
It's possible to get a passing grade without implementing all features, as quality is preferred over quantity. Extra 
points will be given for going above expectations quality-wise.
