# Overview

This is a simple exercise to practice API integration and data procressing skills. The index.ts file first makes a GET request to receive patient information. There are 47 patients, but the API only allows retrieving 20 patients at a time. After retrieving all the records, the program checks the temperature, blood pressure, and age of each patient and assigns a score for each category. Some of the data is corrupted, so they are flagged and scored as a 0. Once each patient is scored, a final function assigns each patient to the high risk, high fever, and data quality categories and then submits this via a POST request to an API that evaluates how well the data was processed.

## How To Install Locally

To clone this repo locally, run the following code in your terminal

```
git clone https://github.com/jentgelmeier/healthcare_api.git
cd healthcare_api
```

## How To Run Locally

I ran this using ts-node. Be sure to have Node installed on your pc. I have version 18.15.0. 

You can install ts-node globally or use npx to run ts-node.

If you install ts-node globally, enter the following: ```ts-node index.ts```

Or if you prefer to use npx, make sure you have npx installed. I have version 9.5.0. Then enter: ```npx ts-node index.ts```

Either way, make sure you run the command from the healthcare_api folder.

*Note: I've used up my 3 attempts, so you won't be able to successfully submit the results anymore.