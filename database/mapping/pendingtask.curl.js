PUT sph/pendingtask/_mapping
{
   "pendingtask": {
      "properties": {
         "WorkflowId": { "type": "long"},
         "Name":{ "type": "string"},
         "Type":{ "type": "string", "index": "not_analyzed"},
         "WebId":{ "type": "string", "index": "not_analyzed"},
         "Correlations":{ "type": "string", "index": "not_analyzed"},
         "Performers":{ "type": "string", "index": "not_analyzed"}
      }
   }
}

PUT sph/pendingtask/1
{
    "WorkflowId" : 3,
    "Name": "Screen 0",
    "Type" : "ScreenActivity",
    "WebId" : "aaaa",
    "Correlations":["bb"],
    "Performers":["ery"]
    
}


PUT sph/pendingtask/2
{
    "WorkflowId" : 4,
    "Name": "Screen 0",
    "Type" : "ScreenActivity",
    "WebId" : "aaaa",
    "Correlations":["bb"],
    "Performers":["ery"]
    
}


PUT sph/pendingtask/3
{
    "WorkflowId" : 33,
    "Name": "Screen 0",
    "Type" : "ScreenActivity",
    "WebId" : "aaaa",
    "Correlations":["bb"],
    "Performers":["umar"]
    
}

GET sph/pendingtask/_search

POST sph/pendingtask/_search
{
    "query": {
        "term": {
           "Performers": {
              "value": "umar"
           }
        }
    }
}


POST sph/pendingtask/_search
{
    "query": {
        "term": {
           "Performers": {
              "value": "ery"
           }
        }
    }
}

