/**
 * Created by koujp on 2017/6/27.
 */
function Promise(){
    this.state = {
        code:0, //1:success 2:error 3 finished
        data:undefined
    };
    this.success = null;
    this.error = null;
    this.deferred = null;
}
Promise.prototype.then = function (success,error) {

    if(typeof success === 'function'){
        this.success = success;
    }
    if(typeof error === 'function'){
        this.error = error;
    }
    this.deferred = new Deferred();
    if(this.state.code !== 0){
        this.execute();
    }
    return this.deferred.promise;
};
function isPromise(p){
    return p && typeof p.then === 'function';
}
Promise.prototype.execute = function () {

    if(this.state.code === 3){
        return;
    }
    var executeType = this.state.code === 1 ? 'success' : 'error';
    this.state.code = 3;
    var result = this.state.data;
    var promise = this;
    var executeResult = null;
    var deferred = promise.deferred;
    try{
        executeResult = promise[executeType] && promise[executeType](result) || result;
    }catch(e){
        if(deferred && deferred.promise.deferred){
            deferred.promise.deferred.reject(e);
        }
        return;
    }
    if(isPromise(executeResult)){
        executeResult.then(function (r) {
            if(deferred){
                deferred.resolve(r);
            }
        }, function (e) {
            if(deferred){
                deferred.reject(e);
            }
        });
        return;
    }

    if(deferred){
        if(this.state.code === 1){
            deferred.resolve(executeResult);
        }else {
            if(promise[executeType]){
                deferred.resolve(executeResult);
            }else{
                deferred.reject(executeResult);
            }
        }

    }
};
function Deferred(){
    this.promise = new Promise();
}
Deferred.prototype.resolve = function (result) {

    var promise = this.promise;
    if(promise.state.code === 3){
        return;
    }
    promise.state.code = 1;
    promise.state.data = result;
    if(!promise.deferred){
        return;
    }
    promise.execute();
};
Deferred.prototype.reject = function (result) {

    var promise = this.promise;
    if(promise.state.code === 3){
        return;
    }
    promise.state.code = 2;
    promise.state.data = result;
    if(!promise.deferred){
        return;
    }
    promise.execute();
};
function $Promise(func){
    if(typeof func !== 'function'){
        throw new TypeError('need a function argument');
    }
    var deferred = new Deferred();
    func(deferred.resolve.bind(deferred),deferred.reject.bind(deferred));
    return deferred.promise;
}
$Promise.deferred = function(){
    return new Deferred();
};
$Promise.resolve = function (data) {
    var deferred = new Deferred();
    deferred.resolve(data);
    return deferred.promise;
};
$Promise.reject = function (data) {
    var deferred = new Deferred();
    deferred.reject(data);
    return deferred.promise;
};
$Promise.all = function (promises) {
    var deferred = new Deferred();
    if(promises && !(promises instanceof Array)){
        promises = [].concat(promises);
    }else if(!promises || promises.length === 0){
        deferred.resolve([]);
        return deferred.promise;
    }
    var promiseCount = promises.length;
    var promiseData = [];
    promises.forEach(function (p,index) {
        p.then(function (data) {
            if(promiseCount < 0){
                return;
            }
            promiseCount--;
            promiseData[index] = data;
            if(promiseCount === 0){
                return deferred.resolve(promiseData);
            }
        }, function (e) {
            promiseCount = -1;
            return deferred.reject(e);
        });
    });
    return deferred.promise;
};
export { $Promise }