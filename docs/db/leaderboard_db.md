# leaderboard.db

[Back](../README.md)

## Purpose

The `leaderboard.db` database is used to store all the information relating to runs on the site.

## Tables

| Table        | Purpose                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| `runs`       | Contains all the information pretaining to individual runs.               |
| `runners`    | Contains all the information pretaining to individual runners.            |
| `categories` | Contains all the information pretaining to individual categories.         |
| `pairs`      | Contains pairs of run and runner id's for matching runners to their runs. |

### runs

| Column        | Type    | Not Null? | Notes                                                                                                                                                |
| ------------- | ------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Integer | Yes\*     | The tables primary key, which is used as an ID for each run.                                                                                         |
| `category_id` | Integer | Yes       | The ID of the category that the run is part of.                                                                                                      |
| `date`        | Integer | Yes       | The date the run was set, stored as a unix timestamp.                                                                                                |
| `time`        | Numeric | Yes       | The time of the run in seconds.                                                                                                                      |
| `duration`    | Integer | Yes       | The amount of time the run has stood as a world record, stored as a unix timestamp.                                                                  |
| `platform`    | Text    | Yes       | The platform the run was performed on, that being either the console or the operating system. In the case of a coop run, the hosts platform is used. |
| `seed`        | Text    | Yes       | The seed of the world the run was performed in.                                                                                                      |
| `version`     | Text    | Yes       | The version of the game that the run was performed on.                                                                                               |
| `input`       | Text    | Yes       | The input method used by the runner, which also supports hybrid controls. In the case of a coop run, the hosts input method is used.                 |
| `link`        | Text    | No        | A link to the run on [speedrun.com](https://www.speedrun.com).                                                                                       |
| `wr`          | Integer | Yes       | A boolean flag signifying if the run is a current standing world record or not.                                                                      |

### runners

| Column        | Type    | Not Null? | Notes                                                                                                                                                                   |
| ------------- | ------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Integer | Yes\*     | The tables primary key, which is used as an ID for each runner. This ID is also used in the url of the players profile.                                                 |
| `name`        | Text    | Yes       | The runners username on [speedrun.com](https://www.speedrun.com). In the case that the runner does not have an account, either a known alias or real name will be used. |
| `nationality` | Text    | No        | The runners nationality, stored as an [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code.                                              |

### categories

| Column         | Type    | Not Null? | Notes                                                                         |
| -------------- | ------- | --------- | ----------------------------------------------------------------------------- |
| `id`           | Integer | Yes\*     | The tables primary key, which is used as an ID for each category.             |
| `readable`     | Text    | Yes       | The full category name, as they appear on the history pages.                  |
| `abbreviation` | Text    | Yes       | The abbrevated category name, which is used in URIs.                          |
| `type`         | Text    | Yes       | The type of category, with the three values being `main`, `il`, and `catext`. |

## pairs

| Column      | Type    | Not Null? | Notes                                        |
| ----------- | ------- | --------- | -------------------------------------------- |
| `run_id`    | Integer | Yes       | The ID of the run.                           |
| `runner_id` | Integer | Yes       | The ID of the runner that performed the run. |

\* The primary keys are not set as `NOT NULL` in the database schema, however there is no scenario in which the primary key will be null.
