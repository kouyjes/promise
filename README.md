# promise
## api ##
```javascript
1.var deferred = HERE.$Promise.deferred();
async-callback(function(data){
  deferred.resolve(data);
});
return deferred.promise;
2.new HERE.$Promise(function(resolve,reject){
  async-callback(function(data){
    resolve(data);
  });
});
```
