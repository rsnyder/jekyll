---
title: Challenges in documenting long JSON objects
categories:
- api-doc
keywords: 
summary: "Documenting long JSON objects (with hundreds of lines of code and multiple levels of nesting) can be challenging. There are different approaches to take, but none of the approaches seems to work well. I updated my API doc course topic with a section comparing the various approaches."
thumbnail: jsondocapproachesthumb.png
---

I'm now documenting an endpoint in a project at work that includes about 200 lines of code in a JSON object passed in the request body. There are various levels of key-value pairs and additionally nested objects inside the JSON object.

Most API documentation explains the parameters available for each endpoint. Usually the parameters are passed in the endpoint URL or, more common with POST methods, in the request body. 

I added a section called [Documenting lengthy JSON objects in request bodies](http://idratherbewriting.com/docapis_doc_parameters/#documenting-lengthy-json-objects-in-request-bodies) in part of my API Documentation course to address the variety of ways people attempt to document long JSON objects. I think most approaches typically fail for this kind of documentation. What do you think is the best approach for documenting long JSON objects?
