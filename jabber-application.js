/**
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2010 Cisco Systems, Inc.  All Rights Reserved.
 */
/*build/dist/CAXL-release-2014.04.10787/src/webinit.js*/
;(function(){var jabberwerx={};jabberwerx.system={jQuery_NoConflict:function(){var jq=jQuery.noConflict(true);if(typeof(window.jQuery)=="undefined"){window.jQuery=jq;}
  if(typeof(window.$)=="undefined"){window.$=jq;}
  return jq;},serializeXMLToString:function(node)
{if(node&&(typeof(XMLSerializer)!="undefined")){return new XMLSerializer().serializeToString(node)}
  return null;},setTimeout:function(func,delay){return window.setTimeout(func,delay);},clearTimeout:function(timeoutID){window.clearTimeout(timeoutID);},setInterval:function(func,delay){return window.setInterval(func,delay);},clearInterval:function(intervalID){window.clearInterval(intervalID);},getConsole:function(){return window.console||null;},getLocale:function(){return navigator.userLanguage||navigator.language;}};jabberwerx.system.createXMLDocument=(function(){var fn=function(){fn=function(){return Windows.Data.Xml.Dom.XmlDocument();};try{return fn();}catch(ex){fn=function(){var doc=new ActiveXObject("Msxml2.DOMDocument.3.0");doc.async=false;return doc;}
  try{return fn();}catch(ex){fn=function(){return document.implementation.createDocument(null,null,null);}
    try{return fn();}catch(ex){fn=function(){throw new Error("No document constructor available.");}
      return fn();}}}}
  return function(){try{return fn();}catch(ex){console.log("Could not create XML Document: "+ex.message);throw ex;}}})();jabberwerx.system.parseXMLFromString=function(xmlstr){var dom=null;try{dom=jabberwerx.system.createXMLDocument();dom.loadXML(xmlstr);}catch(ex){try{dom=(new DOMParser()).parseFromString(xmlstr,"text/xml");}catch(ex){dom=null;}}
  dom=dom?dom.documentElement:null;if(!dom||(dom.nodeName=="parsererror")||(jabberwerx.$("parsererror",dom).length>0))
  {throw new TypeError("Parse error in trying to parse"+xmlstr);}
  return dom;};if(typeof(Node)!="undefined"&&Node.prototype&&typeof(Object.defineProperty)!="undefined")
{Object.defineProperty(Node.prototype,"xml",{get:function(){return jabberwerx.system.serializeXMLToString(this);},enumerable:true,writeable:false,configurable:false});}
  jabberwerx.system.getLocation=function(){return(document&&document.location)||{};};window.jabberwerx=jabberwerx;})();
/*build/dist/CAXL-release-2014.04.10787/src/third_party/jquery/jquery.jstore-all.js*/
/*!
 * jStore - Persistent Client-Side Storage
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 *
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function($){function toIntegersAtLease(n)
{return n<10?'0'+n:n;}
  Date.prototype.toJSON=function(date)
  {return this.getUTCFullYear()+'-'+
    toIntegersAtLease(this.getUTCMonth())+'-'+
    toIntegersAtLease(this.getUTCDate());};var escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};$.quoteString=function(string)
  {if(escapeable.test(string))
  {return'"'+string.replace(escapeable,function(a)
  {var c=meta[a];if(typeof c==='string'){return c;}
    c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
    return'"'+string+'"';};$.toJSON=function(o,compact)
  {var type=typeof(o);if(type=="undefined")
    return"undefined";else if(type=="number"||type=="boolean")
    return o+"";else if(o===null)
    return"null";if(type=="string")
  {return $.quoteString(o);}
    if(type=="object"&&typeof o.toJSON=="function")
      return o.toJSON(compact);if(type!="function"&&typeof(o.length)=="number")
  {var ret=[];for(var i=0;i<o.length;i++){ret.push($.toJSON(o[i],compact));}
    if(compact)
      return"["+ret.join(",")+"]";else
      return"["+ret.join(", ")+"]";}
    if(type=="function"){throw new TypeError("Unable to convert object of type 'function' to json.");}
    var ret=[];for(var k in o){var name;type=typeof(k);if(type=="number")
    name='"'+k+'"';else if(type=="string")
    name=$.quoteString(k);else
    continue;var val=$.toJSON(o[k],compact);if(typeof(val)!="string"){continue;}
    if(compact)
      ret.push(name+":"+val);else
      ret.push(name+": "+val);}
    return"{"+ret.join(", ")+"}";};$.compactJSON=function(o)
  {return $.toJSON(o,true);};$.evalJSON=function(src)
  {return eval("("+src+")");};$.secureEvalJSON=function(src)
  {var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))
    return eval("("+src+")");else
    throw new SyntaxError("Error parsing JSON, source is not valid.");};})(jQuery);(function(){var initializing=false,fnTest=/xyz/.test(function(){xyz;})?/\b_super\b/:/.*/;this.Class=function(){};Class.extend=function(prop){var _super=this.prototype;initializing=true;var prototype=new this();initializing=false;for(var name in prop){prototype[name]=typeof prop[name]=="function"&&typeof _super[name]=="function"&&fnTest.test(prop[name])?(function(name,fn){return function(){var tmp=this._super;this._super=_super[name];var ret=fn.apply(this,arguments);this._super=tmp;return ret;};})(name,prop[name]):prop[name];}
  function Class(){if(!initializing&&this.init)
    this.init.apply(this,arguments);}
  Class.prototype=prototype;Class.constructor=Class;Class.extend=arguments.callee;return Class;};})();(function($){this.jStoreDelegate=Class.extend({init:function(parent){this.parent=parent;this.callbacks={};},bind:function(event,callback){if(!$.isFunction(callback))return this;if(!this.callbacks[event])this.callbacks[event]=[];this.callbacks[event].push(callback);return this;},trigger:function(){var parent=this.parent,args=[].slice.call(arguments),event=args.shift(),handlers=this.callbacks[event];if(!handlers)return false;$.each(handlers,function(){this.apply(parent,args)});return this;}});})(jQuery);(function($){var rxJson;try{rxJson=new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$')}catch(e){rxJson=/^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/}
  $.jStore={};$.extend($.jStore,{EngineOrder:[],Availability:{},Engines:{},Instances:{},CurrentEngine:null,defaults:{project:null,engine:null,autoload:true,flash:'jStore.Flash.html'},isReady:false,isFlashReady:false,delegate:new jStoreDelegate($.jStore).bind('jStore-ready',function(engine){$.jStore.isReady=true;if($.jStore.defaults.autoload)engine.connect();}).bind('flash-ready',function(){$.jStore.isFlashReady=true;}),ready:function(callback){if($.jStore.isReady)callback.apply($.jStore,[$.jStore.CurrentEngine]);else $.jStore.delegate.bind('jStore-ready',callback);},fail:function(callback){$.jStore.delegate.bind('jStore-failure',callback);},flashReady:function(callback){if($.jStore.isFlashReady)callback.apply($.jStore,[$.jStore.CurrentEngine]);else $.jStore.delegate.bind('flash-ready',callback);},use:function(engine,project,identifier){project=project||$.jStore.defaults.project||location.hostname.replace(/\./g,'-')||'unknown';var e=$.jStore.Engines[engine.toLowerCase()]||null,name=(identifier?identifier+'.':'')+project+'.'+engine;if(!e)throw'JSTORE_ENGINE_UNDEFINED';e=new e(project,name);if($.jStore.Instances[name])throw'JSTORE_JRI_CONFLICT';if(e.isAvailable()){$.jStore.Instances[name]=e;if(!$.jStore.CurrentEngine){$.jStore.CurrentEngine=e;}
    $.jStore.delegate.trigger('jStore-ready',e);}else{if(!e.autoload)
    throw'JSTORE_ENGINE_UNAVILABLE';else{e.included(function(){if(this.isAvailable()){$.jStore.Instances[name]=this;if(!$.jStore.CurrentEngine){$.jStore.CurrentEngine=this;}
    $.jStore.delegate.trigger('jStore-ready',this);}
  else $.jStore.delegate.trigger('jStore-failure',this);}).include();}}},setCurrentEngine:function(name){if(!$.jStore.Instances.length)
    return $.jStore.FindEngine();if(!name&&$.jStore.Instances.length>=1){$.jStore.delegate.trigger('jStore-ready',$.jStore.Instances[0]);return $.jStore.CurrentEngine=$.jStore.Instances[0];}
    if(name&&$.jStore.Instances[name]){$.jStore.delegate.trigger('jStore-ready',$.jStore.Instances[name]);return $.jStore.CurrentEngine=$.jStore.Instances[name];}
    throw'JSTORE_JRI_NO_MATCH';},FindEngine:function(){$.each($.jStore.EngineOrder,function(k){if($.jStore.Availability[this]()){$.jStore.use(this,$.jStore.defaults.project,'default');return false;}})},load:function(){if($.jStore.defaults.engine)
    return $.jStore.use($.jStore.defaults.engine,$.jStore.defaults.project,'default');try{$.jStore.FindEngine();}catch(e){}},safeStore:function(value){switch(typeof value){case'object':case'function':return $.jStore.compactJSON(value);case'number':case'boolean':case'string':case'xml':return value;case'undefined':default:return'';}},safeResurrect:function(value){return rxJson.test(value)?$.evalJSON(value):value;},store:function(key,value){if(!$.jStore.CurrentEngine)return false;if(!value)
    return $.jStore.CurrentEngine.get(key);return $.jStore.CurrentEngine.set(key,value);},remove:function(key){if(!$.jStore.CurrentEngine)return false;return $.jStore.CurrentEngine.rem(key);},get:function(key){return $.jStore.store(key);},set:function(key,value){return $.jStore.store(key,value);}})
  $.extend($.fn,{store:function(key,value){if(!$.jStore.CurrentEngine)return this;var result=$.jStore.store(key,value);return!value?result:this;},removeStore:function(key){$.jStore.remove(key);return this;},getStore:function(key){return $.jStore.store(key);},setStore:function(key,value){$.jStore.store(key,value);return this;}})})(jQuery);(function($){this.StorageEngine=Class.extend({init:function(project,name){this.project=project;this.jri=name;this.data={};this.limit=-1;this.includes=[];this.delegate=new jStoreDelegate(this).bind('engine-ready',function(){this.isReady=true;}).bind('engine-included',function(){this.hasIncluded=true;});this.autoload=false;this.isReady=false;this.hasIncluded=false;},include:function(){var self=this,total=this.includes.length,count=0;$.each(this.includes,function(){$.ajax({type:'get',url:this,dataType:'script',cache:true,success:function(){count++;if(count==total)self.delegate.trigger('engine-included');}})});},isAvailable:function(){return false;},interruptAccess:function(){if(!this.isReady)throw'JSTORE_ENGINE_NOT_READY';},ready:function(callback){if(this.isReady)callback.apply(this);else this.delegate.bind('engine-ready',callback);return this;},included:function(callback){if(this.hasIncluded)callback.apply(this);else this.delegate.bind('engine-included',callback);return this;},get:function(key){this.interruptAccess();return this.data[key]||null;},set:function(key,value){this.interruptAccess();this.data[key]=value;return value;},rem:function(key){this.interruptAccess();var beforeDelete=this.data[key];this.data[key]=null;return beforeDelete;}});})(jQuery);(function($){var sessionAvailability=$.jStore.Availability.session=function(){return!!window.sessionStorage;},localAvailability=$.jStore.Availability.local=function(){return!!(window.localStorage||window.globalStorage);};this.jStoreDom=StorageEngine.extend({init:function(project,name){this._super(project,name);this.type='DOM';this.limit=5*1024*1024;},connect:function(){this.delegate.trigger('engine-ready');},get:function(key){this.interruptAccess();var out=this.db.getItem(key);return $.jStore.safeResurrect((out&&out.value?out.value:out));},set:function(key,value){this.interruptAccess();this.db.setItem(key,$.jStore.safeStore(value));return value;},rem:function(key){this.interruptAccess();var out=this.get(key);this.db.removeItem(key);return out}})
  this.jStoreLocal=jStoreDom.extend({connect:function(){this.db=!window.globalStorage?window.localStorage:window.globalStorage[location.hostname];this._super();},isAvailable:localAvailability})
  this.jStoreSession=jStoreDom.extend({connect:function(){this.db=sessionStorage;this._super();},isAvailable:sessionAvailability})
  $.jStore.Engines.local=jStoreLocal;$.jStore.Engines.session=jStoreSession;$.jStore.EngineOrder[1]='local';})(jQuery);(function($){var avilability=$.jStore.Availability.flash=function(){return!!($.jStore.hasFlash('8.0.0'));}
  this.jStoreFlash=StorageEngine.extend({init:function(project,name){this._super(project,name);this.type='Flash';var self=this;$.jStore.flashReady(function(){self.flashReady()});},connect:function(){var name='jstore-flash-embed-'+this.project;$(document.body).append('<iframe style="height:1px;width:1px;position:absolute;left:0;top:0;margin-left:-100px;" '+'id="jStoreFlashFrame" src="'+$.jStore.defaults.flash+'"></iframe>');},flashReady:function(e){var iFrame=$('#jStoreFlashFrame')[0];if(iFrame.Document&&$.isFunction(iFrame.Document['jStoreFlash'].f_get_cookie))this.db=iFrame.Document['jStoreFlash'];else if(iFrame.contentWindow&&iFrame.contentWindow.document){var doc=iFrame.contentWindow.document;if($.isFunction($('object',$(doc))[0].f_get_cookie))this.db=$('object',$(doc))[0];else if($.isFunction($('embed',$(doc))[0].f_get_cookie))this.db=$('embed',$(doc))[0];}
    if(this.db)this.delegate.trigger('engine-ready');},isAvailable:avilability,get:function(key){this.interruptAccess();var out=this.db.f_get_cookie(key);return out=='null'?null:$.jStore.safeResurrect(out);},set:function(key,value){this.interruptAccess();this.db.f_set_cookie(key,$.jStore.safeStore(value));return value;},rem:function(key){this.interruptAccess();var beforeDelete=this.get(key);this.db.f_delete_cookie(key);return beforeDelete;}})
  $.jStore.Engines.flash=jStoreFlash;$.jStore.EngineOrder[2]='flash';$.jStore.hasFlash=function(version){var pv=$.jStore.flashVersion().match(/\d+/g),rv=version.match(/\d+/g);for(var i=0;i<3;i++){pv[i]=parseInt(pv[i]||0);rv[i]=parseInt(rv[i]||0);if(pv[i]<rv[i])return false;if(pv[i]>rv[i])return true;}
    return true;}
  $.jStore.flashVersion=function(){try{try{var axo=new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');try{axo.AllowScriptAccess='always';}
  catch(e){return'6,0,0';}}catch(e){}
    return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g,',').match(/^,?(.+),?$/)[1];}catch(e){try{if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){return(navigator.plugins["Shockwave Flash 2.0"]||navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g,",").match(/^,?(.+),?$/)[1];}}catch(e){}}
    return'0,0,0';}
  window.flash_ready=function(){$.jStore.delegate.trigger('flash-ready');}})(jQuery);(function($){var avilability=$.jStore.Availability.gears=function(){return!!(window.google&&window.google.gears)}
  this.jStoreGears=StorageEngine.extend({init:function(project,name){this._super(project,name);this.type='Google Gears';this.includes.push('http://code.google.com/apis/gears/gears_init.js');this.autoload=true;},connect:function(){var db=this.db=google.gears.factory.create('beta.database');db.open('jstore-'+this.project);db.execute('CREATE TABLE IF NOT EXISTS jstore (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)');this.updateCache();},updateCache:function(){var result=this.db.execute('SELECT k,v FROM jstore');while(result.isValidRow()){this.data[result.field(0)]=$.jStore.safeResurrect(result.field(1));result.next();}result.close();this.delegate.trigger('engine-ready');},isAvailable:avilability,set:function(key,value){this.interruptAccess();var db=this.db;db.execute('BEGIN');db.execute('INSERT OR REPLACE INTO jstore(k, v) VALUES (?, ?)',[key,$.jStore.safeStore(value)]);db.execute('COMMIT');return this._super(key,value);},rem:function(key){this.interruptAccess();var db=this.db;db.execute('BEGIN');db.execute('DELETE FROM jstore WHERE k = ?',[key]);db.execute('COMMIT');return this._super(key);}})
  $.jStore.Engines.gears=jStoreGears;$.jStore.EngineOrder[3]='gears';})(jQuery);(function($){var avilability=$.jStore.Availability.html5=function(){return!!window.openDatabase}
  this.jStoreHtml5=StorageEngine.extend({init:function(project,name){this._super(project,name);this.type='HTML5';this.limit=1024*200;},connect:function(){var db=this.db=openDatabase('jstore-'+this.project,'1.0',this.project,this.limit);if(!db)throw'JSTORE_ENGINE_HTML5_NODB';db.transaction(function(db){db.executeSql('CREATE TABLE IF NOT EXISTS jstore (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)');});this.updateCache();},updateCache:function(){var self=this;this.db.transaction(function(db){db.executeSql('SELECT k,v FROM jstore',[],function(db,result){var rows=result.rows,i=0,row;for(;i<rows.length;++i){row=rows.item(i);self.data[row.k]=$.jStore.safeResurrect(row.v);}
    self.delegate.trigger('engine-ready');});});},isAvailable:avilability,set:function(key,value){this.interruptAccess();this.db.transaction(function(db){db.executeSql('INSERT OR REPLACE INTO jstore(k, v) VALUES (?, ?)',[key,$.jStore.safeStore(value)]);});return this._super(key,value);},rem:function(key){this.interruptAccess();this.db.transaction(function(db){db.executeSql('DELETE FROM jstore WHERE k = ?',[key])})
    return this._super(key);}})
  $.jStore.Engines.html5=jStoreHtml5;$.jStore.EngineOrder[0]='html5';})(jQuery);(function($){var avilability=$.jStore.Availability.ie=function(){return!!window.ActiveXObject;}
  this.jStoreIE=StorageEngine.extend({init:function(project,name){this._super(project,name);this.type='IE';this.limit=64*1024;},connect:function(){this.db=$('<div style="display:none;behavior:url(\'#default#userData\')" id="jstore-'+this.project+'"></div>').appendTo(document.body).get(0);this.delegate.trigger('engine-ready');},isAvailable:avilability,get:function(key){this.interruptAccess();this.db.load(this.project);return $.jStore.safeResurrect(this.db.getAttribute(key));},set:function(key,value){this.interruptAccess();this.db.setAttribute(key,$.jStore.safeStore(value));this.db.save(this.project);return value;},rem:function(key){this.interruptAccess();var beforeDelete=this.get(key);this.db.removeAttribute(key);this.db.save(this.project);return beforeDelete;}})
  $.jStore.Engines.ie=jStoreIE;$.jStore.EngineOrder[4]='ie';})(jQuery);
/*build/dist/CAXL-release-2014.04.10787/src/jabberwerx.js*/
;(function(jabberwerx){var jq=jabberwerx.system.jQuery_NoConflict();jabberwerx.$=jq;jabberwerx=jq.extend(jabberwerx,{version:'2014.04.0',_config:{persistDuration:30,unsecureAllowed:false,capabilityFeatures:[],httpBindingURL:"/httpbinding",baseReconnectCountdown:30,enabledMechanisms:["DIGEST-MD5","PLAIN"]},_getInstallURL:function(){return this._getInstallPath();},_getInstallPath:function(){var p=this._config.installPath;if(!p){var target=String(arguments[0]||"jabberwerx")+".js";p=jabberwerx.$("script[src$='"+target+"']").slice(0,1).attr("src");p=p.substring(0,p.indexOf(target));}
  return p.charAt(p.length-1)=='/'?p:p+'/';},parseTimestamp:function(timestamp){var result=/^([0-9]{4})(?:-?)([0-9]{2})(?:-?)([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2}(?:\.([0-9]+))?)(?:(Z|[-+]?[0-9]{2}:[0-9]{2})?)$/.exec(timestamp);if(!result){throw new TypeError("timestamp string not recognized");}
  var ts,offset=0;ts=Date.UTC(Number(result[1]),Number(result[2])-1,Number(result[3]),Number(result[4]),Number(result[5]),Number(result[6]),0);if(result[8]&&result[8]!="Z"){result=/^([-+]?[0-9]{2}):([0-9]{2})$/.exec(result[8]);if(result){offset+=Number(result[1])*3600000;offset+=Number(result[2])*60000;}}
  return new Date(ts-offset);},generateTimestamp:function(ts,legacy){var padFN=function(val,amt){var result="";if(amt>1){result=arguments.callee(parseInt(val/10),amt-1);}
  return result+String(parseInt(val%10));};if(!(ts&&ts instanceof Date)){throw new TypeError("Expected Date object");}
  var date=[padFN(ts.getUTCFullYear(),4),padFN(ts.getUTCMonth()+1,2),padFN(ts.getUTCDate(),2)];var time=[padFN(ts.getUTCHours(),2),padFN(ts.getUTCMinutes(),2),padFN(ts.getUTCSeconds(),2)];if(legacy){return date.join("")+"T"+time.join(":");}else{return date.join("-")+"T"+time.join(":")+"Z";}},_init:function(){this._inited=true;if(typeof jabberwerx_config!='undefined'){for(var name in jabberwerx_config){var val=jabberwerx_config[name];if(jabberwerx.$.isArray(val)&&val.concat){val=val.concat();}
  this._config[name]=val;}}},reset:function(){if(this.client){this.client.disconnect();}},reduce:function(obj,fn,value){if(!jabberwerx.$.isFunction(fn)){throw new TypeError("expected function object");}
  jabberwerx.$.each(obj,function(idx,item){value=fn(item,value);return true;});return value;},unique:function(arr){if(!jabberwerx.$.isArray(arr)){return arr;}
  var specified={};for(var idx=arr.length-1;idx>=0;idx--){var item=arr[idx];if(!specified[item]){specified[item]=true;}else{arr.splice(idx,1);}}
  return arr;},isText:function(o){return(o&&o.ownerDocument&&o.nodeType==3&&typeof o.nodeName=="string");},isElement:function(o){return(o&&(o.ownerDocument!==undefined)&&(o.nodeType==1)&&(typeof o.nodeName=="string"));},isDocument:function(o){return(o&&(o.documentElement!==undefined)&&(o.nodeType==9)&&(typeof o.nodeName=="string"));},client:null,_inited:false});jabberwerx._config.debug={on:true};jabberwerx.NodeBuilder=function(data){var parent,doc,ns=null;if(data instanceof jabberwerx.NodeBuilder){this.parent=parent=arguments[0];data=arguments[1];doc=parent.document;ns=parent.namespaceURI;}
  if(jabberwerx.isDocument(data)){doc=data;data=doc.documentElement;ns=data.namespaceURI||data.getAttribute("xmlns")||ns;}else if(jabberwerx.isElement(data)){if(!doc){doc=data.ownerDocument;}else if(data.ownerDocument!==doc){data=(doc.importNode)?doc.importNode(data,true):data.cloneNode(true);}
    if(parent&&parent.data){parent.data.appendChild(data);}
    if(!doc.documentElement){doc.appendChild(data);}
    ns=data.namespaceURI||data.getAttribute("xmlns")||ns;}else if(data){if(!doc){doc=this._createDoc();}
    var ename,ln,pre;ename=this._parseName(data,ns);ns=ename.namespaceURI;data=this._createElem(doc,ns,ename.localName,ename.prefix);}else if(!parent){doc=this._createDoc();}
  this.document=doc;this.data=data;this.namespaceURI=ns;};jabberwerx.NodeBuilder.prototype={attribute:function(name,val){var ename=this._parseName(name);if(ename.prefix&&ename.prefix!="xml"&&ename.prefix!="xmlns"){var xmlns="xmlns:"+ename.prefix;if(!this.data.getAttribute(xmlns)){this.attribute(xmlns,ename.namespaceURI||"");}}else if(ename.prefix=="xml"){ename.namespaceURI="http://www.w3.org/XML/1998/namespace";}else if(ename.prefix=="xmlns"||ename.localName=="xmlns"){ename.namespaceURI="http://www.w3.org/2000/xmlns/";}else if(!ename.prefix&&ename.namespaceURI!==null){throw new TypeError("namespaced attributes not supported");}
  var doc=this.document;var elem=this.data;if(typeof(doc.createNode)!="undefined"){var attr=doc.createNode(2,ename.qualifiedName,ename.namespaceURI||"");attr.value=val||"";elem.setAttributeNode(attr);}else if(typeof(elem.setAttributeNS)!="undefined"){elem.setAttributeNS(ename.namespaceURI||"",ename.qualifiedName,val||"");}else{throw new TypeError("unsupported platform");}
  return this;},text:function(val){if(!val){return this;}
  var txt=this.document.createTextNode(val);this.data.appendChild(txt);return this;},element:function(name,attrs){if(!attrs){attrs={};}
  if(typeof(name)!="string"){throw new TypeError("name is not a valid expanded name");}
  var builder=new jabberwerx.NodeBuilder(this,name);for(var key in attrs){if(key=='xmlns'){continue;}
    builder.attribute(key,attrs[key]);}
  return builder;},node:function(n){if(!n){throw new TypeError("node must exist");}
  if(jabberwerx.isDocument(n)){n=n.documentElement;}
  if(jabberwerx.isElement(n)){return new jabberwerx.NodeBuilder(this,n);}else if(jabberwerx.isText(n)){return this.text(n.nodeValue);}else{throw new TypeError("Node must be an XML node");}
  return this;},xml:function(val){var wrapper=(this.namespaceURI)?"<wrapper xmlns='"+this.namespaceURI+"'>":"<wrapper>";wrapper+=val+"</wrapper>";var parsed=this._parseXML(wrapper);var that=this;jabberwerx.$(parsed).contents().each(function(){if(jabberwerx.isElement(this)){new jabberwerx.NodeBuilder(that,this);}else if(jabberwerx.isText(this)){that.text(this.nodeValue);}});return this;},_parseName:function(name,ns){var ptn=/^(?:\{(.*)\})?(?:([^\s{}:]+):)?([^\s{}:]+)$/;var m=name.match(ptn);if(!m){throw new TypeError("name '"+name+"' is not a valid ename");}
  var retval={namespaceURI:m[1],localName:m[3],prefix:m[2]};if(!retval.localName){throw new TypeError("local-name not value");}
  retval.qualifiedName=(retval.prefix)?retval.prefix+":"+retval.localName:retval.localName;if(!retval.namespaceURI){if(name.indexOf("{}")==0){retval.namespaceURI="";}else{retval.namespaceURI=ns||null;}}
  return retval;},_createDoc:jabberwerx.system.createXMLDocument,_parseXML:jabberwerx.system.parseXMLFromString,_createElem:function(doc,ns,ln,pre){var parent=this.parent;var elem;var qn=pre?(pre+":"+ln):ln;var declare=true;if(parent&&parent.data){if(parent.namespaceURI==ns||ns==null||ns==undefined){declare=false;}}else{declare=(ns!=null&&ns!=undefined);}
  if(typeof(doc.createNode)!="undefined"){elem=doc.createNode(1,qn,ns||"");if(declare){var decl=doc.createNode(2,(pre?"xmlns:"+pre:"xmlns"),"http://www.w3.org/2000/xmlns/");decl.value=ns||"";elem.setAttributeNode(decl);}}else if(typeof(doc.createElementNS)!="undefined"){elem=doc.createElementNS(ns||"",qn);if(declare){elem.setAttributeNS("http://www.w3.org/2000/xmlns/",(pre?"xmlns:"+pre:"xmlns"),ns||"");}}else{throw Error("unsupported platform");}
  if(!doc.documentElement){doc.appendChild(elem);}else if(parent&&parent.data){parent.data.appendChild(elem);}
  return elem;}};jabberwerx.xhtmlim={};jabberwerx.xhtmlim.allowedStyles=["background-color","color","font-family","font-size","font-style","font-weight","margin-left","margin-right","text-align","text-decoration"];jabberwerx.xhtmlim.allowedTags={br:[],em:[],strong:[],a:["style","href","type"],blockquote:["style"],cite:["style"],img:["style","alt","height","src","width"],li:["style"],ol:["style"],p:["style"],span:["style"],ul:["style"],body:["style","xmlns","xml:lang"]}
  jabberwerx.xhtmlim.sanitize=function(xhtmlNode){var filterNodes=function(fNode){var myKids=fNode.children();var fDOM=fNode.get(0);if(jabberwerx.xhtmlim.allowedTags[fDOM.nodeName]===undefined){fNode.replaceWith(fDOM.childNodes);fNode.remove();}else{var i=0;while(i<fDOM.attributes.length){var aName=fDOM.attributes[i].nodeName;if(jabberwerx.$.inArray(aName,jabberwerx.xhtmlim.allowedTags[fDOM.nodeName])==-1){fNode.removeAttr(aName);}else{if(aName=="href"||aName=="src"){var aValue=fDOM.attributes[i].nodeValue;if(aValue.indexOf("javascript:")==0){fNode.replaceWith(fDOM.childNodes);fNode.remove();}}else if(aName=="style"){var rProps=jabberwerx.$.map(fDOM.attributes[i].value.split(';'),function(oneStyle,idx){return jabberwerx.$.inArray(oneStyle.split(':')[0],jabberwerx.xhtmlim.allowedStyles)!=-1?oneStyle:null;});fNode.attr("style",rProps.join(';'));}
    ++i;}}}
    for(var i=0;i<myKids.length;++i){if(jabberwerx.isElement(myKids[i])){filterNodes(jabberwerx.$(myKids[i]));}}}
    if(!jabberwerx.isElement(xhtmlNode)){throw new TypeError("xhtmlNode must be a DOM");}
    if(jabberwerx.xhtmlim.allowedTags[xhtmlNode.nodeName]===undefined){throw new TypeError("xhtmlNode must be an allowed tag")}
    filterNodes(jabberwerx.$(xhtmlNode));return xhtmlNode;}
  jabberwerx._init();})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/jwapp/JWCore.js*/
;(function(jabberwerx){jabberwerx.util={};var initializing=false;jabberwerx.JWBase=function(){};jabberwerx.JWBase.prototype.init=function(){};jabberwerx.JWBase.prototype.destroy=function(){return null;};jabberwerx.JWBase.prototype.getClassName=function(){return this._className||'';};jabberwerx.JWBase.prototype.toString=function(){return'['+this.getClassName()+']';};jabberwerx.JWBase.prototype.shouldBeSavedWithGraph=function(){return false;};jabberwerx.JWBase.prototype.shouldBeSerializedInline=function(){return false;};jabberwerx.JWBase.prototype.willBeSerialized=function(){};jabberwerx.JWBase.prototype.wasUnserialized=function(){jabberwerx.$.each(this._observerInfo,function(eventName,info){info.observers=jabberwerx.$.grep(info.observers,function(observer,i){return typeof observer.target!='undefined';});});};jabberwerx.JWBase.prototype.graphUnserialized=function(){}
  jabberwerx.JWBase.prototype.invocation=function(methodName,boundArguments){return jabberwerx.util.generateInvocation(this,methodName,boundArguments);};var __jwa__createOverrideChain=function(base,override){if(base!==undefined&&override===undefined){return base;}
    if(!jabberwerx.$.isFunction(base)||!jabberwerx.$.isFunction(override)){return override;}
    return function(){var tmp=this._super;this._super=base;var retval=override.apply(this,arguments);this._super=tmp;return retval;};};jabberwerx.JWBase.mixin=function(prop){prop=jabberwerx.$.extend(true,{},prop);for(var name in prop){this.prototype[name]=__jwa__createOverrideChain(prop[name],this.prototype[name]);}};jabberwerx.JWBase.intercept=function(prop){prop=jabberwerx.$.extend(true,{},prop);for(var name in prop){this.prototype[name]=__jwa__createOverrideChain(this.prototype[name],prop[name]);}};jabberwerx.JWBase.extend=function(prop,className){var _super=this.prototype;initializing=true;var prototype=new this();initializing=false;for(var name in prop){prototype[name]=__jwa__createOverrideChain(_super[name],prop[name]);};var _superClass=jabberwerx.$.extend({},this);function JWBase(){if(!initializing){if(arguments.length==2&&typeof arguments[0]=='string'&&arguments[0]=='__jw_rehydrate__'){var obj=arguments[1];for(var p in obj){this[p]=obj[p];}}
  else{this._guid=jabberwerx.util.newObjectGUID(className||"");this._jwobj_=true;this._className=(typeof className=='undefined'?null:className);this._observerInfo={};for(var p in this){if(typeof this[p]!='function'){this[p]=jabberwerx.util.clone(this[p]);}}
    if(this.init){this.init.apply(this,arguments);}}}};for(var name in _superClass){JWBase[name]=_superClass[name];}
    JWBase.prototype=prototype;prototype.constructor=JWBase;return JWBase;};jabberwerx.util.Error=function(message){this.message=message;};jabberwerx.util.Error.prototype=new jabberwerx.util.Error();jabberwerx.util.Error.extend=function(message,extension){var f=function(message,extension){this.message=message||this.message;for(var p in extension){this[p]=extension[p];}};f.prototype=new this(message);for(var p in extension){f.prototype[p]=extension[p];}
    return f;}
  jabberwerx.util.NotSupportedError=jabberwerx.util.Error.extend("This operation is not supported");jabberwerx.util._invocations={};jabberwerx.util.generateInvocation=function(object,methodName,boundArguments){var objectTag='_global_';if(jabberwerx.util.isJWObjRef(object)){objectTag=object._guid;}
    var f=jabberwerx.util._invocations[objectTag+'.'+methodName]
    if(typeof f!='undefined'){return f;}
    if(typeof boundArguments!='undefined'){if(typeof boundArguments!='object'||!(boundArguments instanceof Array)){boundArguments=[boundArguments];}}
    else{boundArguments=[];}
    var f=function(){return jabberwerx.util.invoke.apply(arguments.callee,[arguments.callee].concat(boundArguments,Array.prototype.slice.call(arguments)));};f.object=object;f.methodName=methodName;f._jwinvocation_=true;jabberwerx.util._invocations[objectTag+'.'+methodName]=f;return f;};jabberwerx.util.invoke=function(){var invocation=arguments[0];var args=Array.prototype.slice.call(arguments,1);if(typeof invocation.object=='undefined'||!invocation.object){return window[invocation.methodName].apply(window,args);}
  else{return invocation.object[invocation.methodName].apply(invocation.object,args);}};jabberwerx.util.eventNames=['jw_valueChanged','jw_collectionChanged',];jabberwerx.util.registerEventName=function(name){if(jabberwerx.util.eventNames.indexOf(name)==-1){jabberwerx.util.eventNames.push(name);}
  else{throw new jabberwerx.util.EventNameAlreadyRegisteredError('JW event name '+name+' already registered!');}};jabberwerx.util.EventNameAlreadyRegisteredError=jabberwerx.util.Error.extend('That event name is already registered!');jabberwerx.util._objectUIDCounter=0;jabberwerx.util.newObjectGUID=function(className){jabberwerx.util._objectUIDCounter=(jabberwerx.util._objectUIDCounter+1==Number.MAX_VALUE)?0:jabberwerx.util._objectUIDCounter+1;return'_jwobj_'+className.replace(/\./g,"_")+'_'+(new Date().valueOf()+jabberwerx.util._objectUIDCounter).toString();};jabberwerx.util._escapeString=function(str){return('"'+str.replace(/(["\\])/g,'\\$1')+'"').replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r");};jabberwerx.util.isString=function(it){return!!arguments.length&&it!=null&&(typeof it=="string"||it instanceof String);};jabberwerx.util.isArray=function(it){return it&&(it instanceof Array||typeof it=="array");};jabberwerx.util._getParts=function(arr,obj,cb){return[jabberwerx.util.isString(arr)?arr.split(""):arr,obj||window,jabberwerx.util.isString(cb)?new Function("item","index","array",cb):cb];};jabberwerx.util.map=function(arr,callback,thisObject){var _p=jabberwerx.util._getParts(arr,thisObject,callback);arr=_p[0];var outArr=(arguments[3]?(new arguments[3]()):[]);for(var i=0;i<arr.length;++i){outArr.push(_p[2].call(_p[1],arr[i],i,arr));}
    return outArr;};jabberwerx.util.isJWObjGUID=function(ref){return(typeof ref=='string'&&(ref.indexOf('_jwobj_')==0||ref.indexOf('"_jwobj_')==0));}
  jabberwerx.util.isJWObjRef=function(ref){return(ref&&typeof ref=='object'&&typeof ref._jwobj_=='boolean'&&ref._jwobj_);}
  jabberwerx.util.isJWInvocation=function(ref){return(ref&&(typeof ref._jwinvocation_!='undefined'));};jabberwerx.util.clone=function(arg){if(typeof arg=='object'&&arg!=null){if(arg instanceof Array){var copy=[];for(var i=0;i<arg.length;i++){copy.push(jabberwerx.util.clone(arg[i]));}}
    if(typeof copy=='undefined'){var copy={};}
    for(var p in arg){copy[p]=jabberwerx.util.clone(arg[p]);}
    if(typeof arg.prototype!='undefined'){copy.prototype=arg.prototype;}}
  else{var copy=arg;}
    return copy;};jabberwerx.util.slugify=function(string,separator){return string.toLowerCase().replace('-',separator).replace(/[^%a-z0-9 _-]/g,'').replace(/\s+/g,(typeof separator!='undefined'?separator:'-'));};jabberwerx.util.encodeSerialization=function(s){if(s){return jabberwerx.util.crypto.b64Encode(jabberwerx.util.crypto.utf8Encode(s));}
    return'';}
  jabberwerx.util.decodeSerialization=function(s){if(s){return jabberwerx.util.crypto.utf8Decode(jabberwerx.util.crypto.b64Decode(s));}
    return'';}
  if(!Array.prototype.indexOf){Array.prototype.indexOf=function(elt){var len=this.length;var from=Number(arguments[1])||0;from=(from<0)?Math.ceil(from):Math.floor(from);if(from<0)
    from+=len;for(;from<len;from++){if(from in this&&this[from]===elt)return from;}
    return-1;};}
  jabberwerx.util.unserializeXMLDoc=function(s,wrap){if(!s&&!wrap){return null;}
    if(typeof wrap=='string'){s='<'+wrap+'>'+s+'</'+wrap+'>';}
    var builder=new jabberwerx.NodeBuilder("nbwrapper");builder.xml(s);var unwrapped=builder.data.childNodes[0];builder.data.removeChild(unwrapped);builder.document.removeChild(builder.data);builder.document.appendChild(unwrapped);return builder.document;};jabberwerx.util.unserializeXML=function(s,wrap){var d=jabberwerx.util.unserializeXMLDoc(s,wrap);return(d?d.documentElement:d);};jabberwerx.util.serializeXML=function(n){try{if(n.hasOwnProperty("xml")){return n.xml;}else if(n.getXml){return n.getXml();}else{return jabberwerx.system.serializeXMLToString(n);}}catch(e){return n.xml||null;}};jabberwerx.util.debug={consoleDelegate:null,console:jabberwerx.system.getConsole()||null}
  jabberwerx.$.each(['log','dir','warn','error','info','debug'],function(i,e){jabberwerx.util.debug[e]=function(a,streamName){if(!jabberwerx._config.debug.on||(jabberwerx.util.isString(streamName)&&!jabberwerx._config.debug[streamName])){return;}
    if(jabberwerx.util.isString(streamName)){a='['+streamName+'] '+a;}
    try{jabberwerx.util.debug.console[e](a);}catch(ex){}
    if(jabberwerx.util.debug.consoleDelegate){jabberwerx.util.debug.consoleDelegate[e](a);}}});jabberwerx.util.setDebugStream=function(streamName,value){jabberwerx._config.debug[streamName]=(typeof value=='undefined'?true:value);};})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/jwapp/JWPersist.js*/
;(function(jabberwerx){jabberwerx.util.config={maxGraphAge:30};var __MULTI_KEY_STORE="_jw_store_.",__MULTI_KEY_TIMESTAMP="_jw_store_timestamp_.",__MULTI_KEY_INDEX="_jw_store_keys_.",__JW_STORE="_jw_store_",__JW_STORE_TIMESTAMP="_jw_store_timestamp_";function __remove(key){if(!jabberwerx.$.jStore||!jabberwerx.$.jStore.isReady||!jabberwerx.$.jStore.CurrentEngine.isReady){throw new jabberwerx.util.JWStorageRequiresjQueryjStoreError();}
  try{jabberwerx.$.jStore.remove(__MULTI_KEY_STORE+key);jabberwerx.$.jStore.remove(__MULTI_KEY_TIMESTAMP+key);jabberwerx.$.jStore.remove(__MULTI_KEY_INDEX+key);jabberwerx.$.jStore.remove(__JW_STORE+key);jabberwerx.$.jStore.remove(__JW_STORE_TIMESTAMP+key);}catch(e){jabberwerx.util.debug.warn("jStore exception ("+e.message+") trying to remove "+key);}};function __timestamp(key,value){if(!jabberwerx.$.jStore||!jabberwerx.$.jStore.isReady||!jabberwerx.$.jStore.CurrentEngine.isReady){throw new jabberwerx.util.JWStorageRequiresjQueryjStoreError();}
  if(value!==undefined){jabberwerx.$.jStore.store(__JW_STORE_TIMESTAMP+key,value);}else{value=jabberwerx.$.jStore.store(__JW_STORE_TIMESTAMP+key);if(!value){value=jabberwerx.$.jStore.store(__MULTI_KEY_TIMESTAMP+key);}}
  return value;};function __store(key,value){if(!jabberwerx.$.jStore||!jabberwerx.$.jStore.isReady||!jabberwerx.$.jStore.CurrentEngine.isReady){throw new jabberwerx.util.JWStorageRequiresjQueryjStoreError();}
  var keystr=__JW_STORE+key;if(value!==undefined){try{value=jabberwerx.util.serialize(value);value=__escapeJSON(value);jabberwerx.$.jStore.store(keystr,value);__timestamp(key,new Date().getTime());}catch(e){jabberwerx.util.debug.warn("jStore exception ("+e.message+") trying to write "+keystr);}}else{try{value=jabberwerx.$.jStore.store(keystr);}catch(e){jabberwerx.util.debug.warn("jStore exception ("+e.message+") trying to read "+keystr);value=null;}
    if(value){if(jabberwerx.util.isString(value)){try{value=__unescapeJSON(value);value=eval("("+value+")");}catch(e){jabberwerx.util.debug.warn("Could not evaluate json string returned from storage:"+e);value=null;}}else{jabberwerx.util.debug.warn("Non string returned from storage");value=null;}}else{keystr=__MULTI_KEY_INDEX+key;value=jabberwerx.$.jStore.store(keystr);if(value){if(!jabberwerx.$.isPlainObject(value)){jabberwerx.util.debug.warn("Unknown object type returned from storage");value=null;}
      for(var onekey in value){value[onekey]=jabberwerx.$.jStore.store(__MULTI_KEY_STORE+onekey);__remove(onekey);value[onekey]=eval('('+value[onekey]+')');}}else{value=null;}}
    __remove(key);}
  return value;};function __jsonPrep(treeRoot){var registry={};function fixupRef(ref){if(jabberwerx.util.isJWObjRef(ref)){if(ref.shouldBeSavedWithGraph&&!ref.shouldBeSavedWithGraph()){return undefined;}
  if(!ref._className){return undefined;}
  if(!ref.shouldBeSerializedInline||!ref.shouldBeSerializedInline()){if(registry[ref._guid]===undefined){registry[ref._guid]=ref;ref.willBeSerialized&&ref.willBeSerialized();fixupTree(ref);}
    return ref._guid;}else{ref.willBeSerialized&&ref.willBeSerialized();return ref;}}
  if(jabberwerx.util.isJWInvocation(ref)){return{object:ref.object._guid,methodName:ref.methodName,_jwinvocation_:true};}
  return ref;};function fixupTree(root){var recurse=arguments.callee;if(jabberwerx.util.isJWObjRef(root)||jabberwerx.$.isPlainObject(root)){for(var p in root){if(root.hasOwnProperty(p)){root[p]=fixupRef(root[p]);recurse(root[p]);}}}else if(jabberwerx.$.isArray(root)){for(var i=0;i<root.length;++i){root[i]=fixupRef(root[i]);recurse(root[i]);}}};fixupTree(treeRoot);treeRoot=fixupRef(treeRoot);return registry;};var __escapeJSON=function(json){return"JWA-"+json;};var __unescapeJSON=function(json){return json.slice(4);};jabberwerx.util._markGraph=function(tag,root){if(jabberwerx.util._graphRegistry){if(root&&(!root.shouldBeSerializedInline||!root.shouldBeSerializedInline())){jabberwerx.util._graphRegistry[tag]={timestamp:new Date(),value:root,graph:jabberwerx.util.findReachableGUIDs(root)};}else{delete jabberwerx.util._graphRegistry[tag];}}};jabberwerx.util.serialize=function(it,prettyPrint,_indentStr){var f=function(it,prettyPrint,_indentStr){if(it===undefined){return"undefined";}
  var objtype=typeof it;if(objtype=="number"||objtype=="boolean"){return it+"";}
  if(it===null){return"null";}
  if(jabberwerx.util.isString(it)){return jabberwerx.util._escapeString(it);}
  if((typeof it.nodeType=='number')&&(typeof it.cloneNode=='function')){return'{}';}
  var recurse=arguments.callee;var newObj;_indentStr=_indentStr||"";var nextIndent=prettyPrint?_indentStr+"\t":"";if(typeof it.__json__=="function"){newObj=it.__json__();if(it!==newObj){return recurse(newObj,prettyPrint,nextIndent);}}
  if(typeof it.json=="function"){newObj=it.json();if(it!==newObj){return recurse(newObj,prettyPrint,nextIndent);}}
  var sep=prettyPrint?" ":"";var newLine=prettyPrint?"\n":"";var val;if(jabberwerx.util.isArray(it)){var res=jabberwerx.util.map(it,function(obj){val=recurse(obj,prettyPrint,nextIndent);if(typeof val!="string"){val="undefined";}
    return newLine+nextIndent+val;});return"["+res.join(","+sep)+newLine+_indentStr+"]";}
  if(objtype=="function"){return null;}
  var output=[];if(!('responseText'in it)&&!('responseXML'in it)){try{for(var key in it){break;}}
  catch(e){return"null";}
    for(var key in it){if(it[key]===undefined){continue;}
      var keyStr;if(typeof key=="number"){keyStr='"'+key+'"';}else if(typeof key=="string"){keyStr=jabberwerx.util._escapeString(key);}else{continue;}
      val=recurse(it[key],prettyPrint,nextIndent);if(typeof val!="string"){continue;}
      output.push(newLine+nextIndent+keyStr+":"+sep+val);}}
  return"{"+output.join(","+sep)+newLine+_indentStr+"}";};return f(it,prettyPrint,_indentStr);}
  jabberwerx.util.findReachableGUIDs=function(start){var traversedGUIDs={};(function f(root,depth){if(typeof root=='object'&&root!=null){var s='';for(var p=0;p<depth;p++){s+='   ';}
    if(jabberwerx.util.isArray(root)){for(var i=0;i<root.length;i++){if(root[i]){f(root[i],depth+1);}}}
    else if(jabberwerx.util.isJWObjRef(root)){if(traversedGUIDs[root._guid]===undefined){traversedGUIDs[root._guid]=root;for(var p in root){if(root[p]){f(root[p],depth+1);}}}}
    else if(root.constructor==Object){for(var p in root){try{if(root[p]&&typeof root[p]=='object'){f(root[p],depth+1);}}catch(e){jabberwerx.util.debug.log('Exception throw while searching for reachable GUIDs: '
      +' Property: '+p
      +' Exception: '+e.message);}}}}})(start,0);return traversedGUIDs;};jabberwerx.util.saveGraph=function(root,tag,callback){try{var objRefs=__jsonPrep(root);objRefs[tag]=root;var serializedRoot=__store(tag,objRefs);var serialized={};serialized[tag]='{"reference":'+serializedRoot+',"timestamp":'+__timestamp(tag)+'}';if(callback){callback(serialized);}
    return serialized;}catch(e){jabberwerx.util.debug.warn("Could not store '"+tag+"'("+e.message+")");throw(e);}};jabberwerx.util.loadGraph=function(tag){var tagStore={};var knitter;var __creator=function(base){return eval('new '+base._className+'("__jw_rehydrate__", base)');}
    knitter=function(arg,registry){if(!arg){return arg;}
      switch(typeof arg){case'string':if(jabberwerx.util.isJWObjGUID(arg)){if(registry[arg]===undefined){jabberwerx.util.debug.warn("Unrecognized GUID: "+arg,'persistence');}
        return knitter(registry[arg],registry);}
        break;case'object':if(jabberwerx.util.isJWInvocation(arg)){var typeObject=knitter(arg.object,registry);if(!typeObject){return null;}
        return jabberwerx.util.generateInvocation(typeObject,arg.methodName);}
        if(jabberwerx.util.isJWObjRef(arg)){if(arg.__knitted){return arg;}
          if(registry[arg._guid]===undefined){arg=__creator(arg);}else{}
          arg.__knitted=true;}
        for(var key in arg){if(key!='_guid'){arg[key]=knitter(arg[key],registry);}}
        break;case'array':for(var i in arg){arg[i]=knitter(arg[i],registry);}
        break;}
      return arg;};tagStore=null;var ts=jabberwerx.util.getLoadedGraphAge(tag);if(ts&&(ts.getTime()<jabberwerx.util.getMaxGraphAge()*1000)){tagStore=__store(tag);}
    if(!tagStore){__remove(tag);return null;}
    try{var root=null;if(!jabberwerx.util.isJWObjRef(tagStore[tag])){root=tagStore[tag];delete tagStore[tag];}
      for(var p in tagStore){if(tagStore.hasOwnProperty(p)){tagStore[p]=__creator(tagStore[p]);}}
      if(!root){root=tagStore[tag];}
      root=knitter(root,tagStore);for(var guid in tagStore){tagStore[guid].wasUnserialized&&tagStore[guid].wasUnserialized();}
      for(var guid in tagStore){delete tagStore[guid].__knitted;tagStore[guid].graphUnserialized&&tagStore[guid].graphUnserialized();}
      return root;}catch(e){jabberwerx.util.debug.warn('Could not load '+tag+" ( "+e+")");throw(e);}};jabberwerx.util.isGraphSaved=function(tag){return __timestamp(tag)!=null;};jabberwerx.util.clearGraph=function(tag){__remove(tag);};jabberwerx.util.getLoadedGraphTimestamp=function(tag){if(tag){var ts=__timestamp(tag);if(ts){var rd=new Date();rd.setTime(ts);return rd;}}
    return null;};jabberwerx.util.getLoadedGraphAge=function(tag){var t=jabberwerx.util.getLoadedGraphTimestamp(tag);if(t){return new Date(new Date().getTime()-t.getTime());}
    return null;};jabberwerx.util.getMaxGraphAge=function(){if(typeof(jabberwerx._config.persistDuration)!="number"){jabberwerx._config.persistDuration=parseInt(jabberwerx._config.persistDuration);}
    return jabberwerx._config.persistDuration;}
  jabberwerx.util.setMaxGraphAge=function(age){if(age&&typeof age=="number"&&age>0){jabberwerx._config.persistDuration=age;}
    return jabberwerx.util.getMaxGraphAge();}
  jabberwerx.util.JWStorageRequiresjQueryjStoreError=jabberwerx.util.Error.extend('JW storage features require jQuery-jStore.');jabberwerx.util._graphRegistry=null;jabberwerx.$.jStore&&jabberwerx.$(document).ready(function(){jabberwerx.$.jStore.EngineOrder=jabberwerx._config.engineOrder?jabberwerx._config.engineOrder:['local','html5','gears','ie'];jabberwerx.$.jStore.ready(function(engine){jabberwerx.util.debug.log("jStore ready("+engine.type+")","persistence");engine.ready(function(){jabberwerx.util.debug.log("jStore engine ready: "+engine.type,"persistence");});});if(!jabberwerx.$.jStore.isReady){jabberwerx.$.jStore.load();}
    return true;});})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/jwapp/JWModel.js*/
;(function(jabberwerx){jabberwerx.JWModel=jabberwerx.JWBase.extend({init:function(){},shouldBeSavedWithGraph:function(){return true;}},'JWModel');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/jwapp/JWApp.js*/
;(function(jabberwerx){var _jwappinst=null;var _jwappclass="";jabberwerx.JWApp=jabberwerx.JWBase.extend({init:function(){this._super();this.appCreate();},shouldBeSavedWithGraph:function(){return true;},appCreate:function(){},appInitialize:function(){}},"JWApp");jabberwerx.util.persistedApplicationClass=function(appClass){if(!appClass){return _jwappclass;}
  _jwappclass=appClass;_jwappinst=null;jabberwerx.$(document).bind("ready",function(){jabberwerx.$.jStore.ready(function(engine){engine.ready(function(){_jwappinst=jabberwerx.util.loadApp();});});return true;});jabberwerx.$(window).bind("unload",function(){try{jabberwerx.util.saveApp();}catch(e){jabberwerx.util.debug.log('Exception persisting application: '+e.message);}
    _jwappinst=null;});return appClass;}
  jabberwerx.util.persistedApplicationInstance=function(){return _jwappinst;}
  jabberwerx.util.loadApp=function(className){var appInst=null;var cn=className;if(!cn){cn=_jwappclass;}
    if(cn){appInst=jabberwerx.util.loadGraph(cn);if(!appInst){eval('appInst = new '+cn+'()');}
      appInst.appInitialize();}
    return appInst;};jabberwerx.util.saveApp=function(appInst){var ai=appInst;if(!ai){ai=_jwappinst;}
    if(ai){jabberwerx.util.saveGraph(ai,ai.getClassName());if(!appInst){_jwappinst=null;}}};_jwappclass='';_jwappinst=null;})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/util/crypt.js*/
;(function(jabberwerx){jabberwerx.util.crypto={};jabberwerx.util.crypto.b64Encode=function(input){var table="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";for(var idx=0;idx<input.length;idx+=3){var data=input.charCodeAt(idx)<<16|input.charCodeAt(idx+1)<<8|input.charCodeAt(idx+2);output+=table.charAt((data>>>18)&0x003f)+
  table.charAt((data>>>12)&0x003f);output+=((idx+1)<input.length)?table.charAt((data>>>6)&0x003f):"=";output+=((idx+2)<input.length)?table.charAt(data&0x003f):"=";}
  return output;};jabberwerx.util.crypto.b64Decode=function(input){var table="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";for(var idx=0;idx<input.length;idx+=4){var h=[table.indexOf(input.charAt(idx)),table.indexOf(input.charAt(idx+1)),table.indexOf(input.charAt(idx+2)),table.indexOf(input.charAt(idx+3))];var data=(h[0]<<18)|(h[1]<<12)|(h[2]<<6)|h[3];if(input.charAt(idx+2)=='='){data=String.fromCharCode((data>>>16)&0x00ff);}else if(input.charAt(idx+3)=='='){data=String.fromCharCode((data>>>16)&0x00ff,(data>>>8)&0x00ff);}else{data=String.fromCharCode((data>>>16)&0x00ff,(data>>>8)&0x00ff,data&0x00ff);}
  output+=data;}
  return output;};jabberwerx.util.crypto.utf8Encode=function(input){var output="";var i=-1;var x,y;while(++i<input.length){x=input.charCodeAt(i);y=i+1<input.length?input.charCodeAt(i+1):0;if(0xD800<=x&&x<=0xDBFF&&0xDC00<=y&&y<=0xDFFF){x=0x10000+((x&0x03FF)<<10)+(y&0x03FF);i++;}
  if(x<=0x7F)
    output+=String.fromCharCode(x);else if(x<=0x7FF)
    output+=String.fromCharCode(0xC0|((x>>>6)&0x1F),0x80|(x&0x3F));else if(x<=0xFFFF)
    output+=String.fromCharCode(0xE0|((x>>>12)&0x0F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));else if(x<=0x1FFFFF)
    output+=String.fromCharCode(0xF0|((x>>>18)&0x07),0x80|((x>>>12)&0x3F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));}
  return output;}
  jabberwerx.util.crypto.utf8Decode=function(input){var output="";for(idx=0;idx<input.length;idx++){var c=[input.charCodeAt(idx),input.charCodeAt(idx+1),input.charCodeAt(idx+2),input.charCodeAt(idx+3)];var pt;if(0x7f>=c[0]){pt=c[0];}else if(0xc2<=c[0]&&0xdf>=c[0]&&0x80<=c[1]&&0xbf>=c[1]){pt=((c[0]&0x001f)<<6)|(c[1]&0x003f);idx+=1;}else if(((0xe0==c[0]&&0xa0<=c[1]&&0xbf>=c[1])||(0xe1<=c[0]&&0xec>=c[0]&&0x80<=c[1]&&0xbf>=c[1])||(0xed==c[0]&&0x80<=c[1]&&0x9f>=c[1])||(0xee<=c[0]&&0xef>=c[0]&&0x80<=c[1]&&0xbf>=c[1]))&&0x80<=c[2]&&0xbf>=c[2]){pt=((c[0]&0x000f)<<12)|((c[1]&0x003f)<<6)|(c[2]&0x003f);idx+=2;}else if(((0xf0==c[0]&&0x90<=c[1]&&0xbf>=c[1])||(0xf1<=c[0]&&0xf3>=c[0]&&0x80<=c[1]&&0xbf>=c[1])||(0xf4==c[0]&&0x80<=c[1]&&0x8f>=c[1])||(0xf5<=c[0]&&0xf7>=c[0]&&0x80<=c[1]&&0xbf>=c[1]))&&0x80<=c[2]&&0xbf>=c[2]&&0x80<=c[3]&&0xbf>=c[3]){pt=((c[0]&0x0007)<<18)|((c[1]&0x003f)<<12)|((c[2]&0x003f)<<6)|(c[3]&0x003f);idx+=3;}else{throw new Error("invalid UTF-8 at position: "+idx);}
    output+=String.fromCharCode(pt);}
    return output;};jabberwerx.util.crypto.str2hex=function(input,useUpperCase){var hex_tab=useUpperCase?"0123456789ABCDEF":"0123456789abcdef";var output="";var x;for(var i=0;i<input.length;i++){x=input.charCodeAt(i);output+=hex_tab.charAt((x>>>4)&0x0F)
    +hex_tab.charAt(x&0x0F);}
    return output;}
  jabberwerx.util.crypto.b64_sha1=function(input){return jabberwerx.util.crypto.b64Encode(jabberwerx.util.crypto.str_sha1(input));}
  jabberwerx.util.crypto.str_sha1=function(input){var rstr2binb=function(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++)
    output[i]=0;for(var i=0;i<input.length*8;i+=8)
    output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(24-i%32);return output;}
    var binb2rstr=function(input){var output="";for(var i=0;i<input.length*32;i+=8){output+=String.fromCharCode((input[i>>5]>>>(24-i%32))&0xFF);}
      return output;}
    var safe_add=function(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);}
    var bit_rol=function(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
    var sha1_ft=function(t,b,c,d){if(t<20)return(b&c)|((~b)&d);if(t<40)return b^c^d;if(t<60)return(b&c)|(b&d)|(c&d);return b^c^d;}
    var sha1_kt=function(t){return(t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;}
    var binb_sha1=function(x,len){x[len>>5]|=0x80<<(24-len%32);x[((len+64>>9)<<4)+15]=len;var w=Array(80);var a=1732584193;var b=-271733879;var c=-1732584194;var d=271733878;var e=-1009589776;for(var i=0;i<x.length;i+=16){var olda=a;var oldb=b;var oldc=c;var oldd=d;var olde=e;for(var j=0;j<80;j++){if(j<16){w[j]=x[i+j];}else{w[j]=bit_rol(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);}
      var t=safe_add(safe_add(bit_rol(a,5),sha1_ft(j,b,c,d)),safe_add(safe_add(e,w[j]),sha1_kt(j)));e=d;d=c;c=bit_rol(b,30);b=a;a=t;}
      a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd);e=safe_add(e,olde);}
      return Array(a,b,c,d,e);}
    return binb2rstr(binb_sha1(rstr2binb(input),input.length*8));}
  jabberwerx.util.crypto.hex_md5=function(input){return jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(input));}
  jabberwerx.util.crypto.rstr_md5=function(input){function md5_cmn(q,a,b,x,s,t){return safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b);}
    function md5_ff(a,b,c,d,x,s,t){return md5_cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function md5_gg(a,b,c,d,x,s,t){return md5_cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function md5_hh(a,b,c,d,x,s,t){return md5_cmn(b^c^d,a,b,x,s,t);}
    function md5_ii(a,b,c,d,x,s,t){return md5_cmn(c^(b|(~d)),a,b,x,s,t);}
    var safe_add=function(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);}
    var bit_rol=function(num,cnt){return(num<<cnt)|(num>>>(32-cnt));}
    var rstr2binl=function(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++){output[i]=0;}
      for(var i=0;i<input.length*8;i+=8){output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(i%32);}
      return output;}
    var binl2rstr=function(input){var output="";for(var i=0;i<input.length*32;i+=8){output+=String.fromCharCode((input[i>>5]>>>(i%32))&0xFF);}
      return output;}
    var binl_md5=function(x,len){x[len>>5]|=0x80<<((len)%32);x[(((len+64)>>>9)<<4)+14]=len;var a=1732584193;var b=-271733879;var c=-1732584194;var d=271733878;for(var i=0;i<x.length;i+=16){var olda=a;var oldb=b;var oldc=c;var oldd=d;a=md5_ff(a,b,c,d,x[i+0],7,-680876936);d=md5_ff(d,a,b,c,x[i+1],12,-389564586);c=md5_ff(c,d,a,b,x[i+2],17,606105819);b=md5_ff(b,c,d,a,x[i+3],22,-1044525330);a=md5_ff(a,b,c,d,x[i+4],7,-176418897);d=md5_ff(d,a,b,c,x[i+5],12,1200080426);c=md5_ff(c,d,a,b,x[i+6],17,-1473231341);b=md5_ff(b,c,d,a,x[i+7],22,-45705983);a=md5_ff(a,b,c,d,x[i+8],7,1770035416);d=md5_ff(d,a,b,c,x[i+9],12,-1958414417);c=md5_ff(c,d,a,b,x[i+10],17,-42063);b=md5_ff(b,c,d,a,x[i+11],22,-1990404162);a=md5_ff(a,b,c,d,x[i+12],7,1804603682);d=md5_ff(d,a,b,c,x[i+13],12,-40341101);c=md5_ff(c,d,a,b,x[i+14],17,-1502002290);b=md5_ff(b,c,d,a,x[i+15],22,1236535329);a=md5_gg(a,b,c,d,x[i+1],5,-165796510);d=md5_gg(d,a,b,c,x[i+6],9,-1069501632);c=md5_gg(c,d,a,b,x[i+11],14,643717713);b=md5_gg(b,c,d,a,x[i+0],20,-373897302);a=md5_gg(a,b,c,d,x[i+5],5,-701558691);d=md5_gg(d,a,b,c,x[i+10],9,38016083);c=md5_gg(c,d,a,b,x[i+15],14,-660478335);b=md5_gg(b,c,d,a,x[i+4],20,-405537848);a=md5_gg(a,b,c,d,x[i+9],5,568446438);d=md5_gg(d,a,b,c,x[i+14],9,-1019803690);c=md5_gg(c,d,a,b,x[i+3],14,-187363961);b=md5_gg(b,c,d,a,x[i+8],20,1163531501);a=md5_gg(a,b,c,d,x[i+13],5,-1444681467);d=md5_gg(d,a,b,c,x[i+2],9,-51403784);c=md5_gg(c,d,a,b,x[i+7],14,1735328473);b=md5_gg(b,c,d,a,x[i+12],20,-1926607734);a=md5_hh(a,b,c,d,x[i+5],4,-378558);d=md5_hh(d,a,b,c,x[i+8],11,-2022574463);c=md5_hh(c,d,a,b,x[i+11],16,1839030562);b=md5_hh(b,c,d,a,x[i+14],23,-35309556);a=md5_hh(a,b,c,d,x[i+1],4,-1530992060);d=md5_hh(d,a,b,c,x[i+4],11,1272893353);c=md5_hh(c,d,a,b,x[i+7],16,-155497632);b=md5_hh(b,c,d,a,x[i+10],23,-1094730640);a=md5_hh(a,b,c,d,x[i+13],4,681279174);d=md5_hh(d,a,b,c,x[i+0],11,-358537222);c=md5_hh(c,d,a,b,x[i+3],16,-722521979);b=md5_hh(b,c,d,a,x[i+6],23,76029189);a=md5_hh(a,b,c,d,x[i+9],4,-640364487);d=md5_hh(d,a,b,c,x[i+12],11,-421815835);c=md5_hh(c,d,a,b,x[i+15],16,530742520);b=md5_hh(b,c,d,a,x[i+2],23,-995338651);a=md5_ii(a,b,c,d,x[i+0],6,-198630844);d=md5_ii(d,a,b,c,x[i+7],10,1126891415);c=md5_ii(c,d,a,b,x[i+14],15,-1416354905);b=md5_ii(b,c,d,a,x[i+5],21,-57434055);a=md5_ii(a,b,c,d,x[i+12],6,1700485571);d=md5_ii(d,a,b,c,x[i+3],10,-1894986606);c=md5_ii(c,d,a,b,x[i+10],15,-1051523);b=md5_ii(b,c,d,a,x[i+1],21,-2054922799);a=md5_ii(a,b,c,d,x[i+8],6,1873313359);d=md5_ii(d,a,b,c,x[i+15],10,-30611744);c=md5_ii(c,d,a,b,x[i+6],15,-1560198380);b=md5_ii(b,c,d,a,x[i+13],21,1309151649);a=md5_ii(a,b,c,d,x[i+4],6,-145523070);d=md5_ii(d,a,b,c,x[i+11],10,-1120210379);c=md5_ii(c,d,a,b,x[i+2],15,718787259);b=md5_ii(b,c,d,a,x[i+9],21,-343485551);a=safe_add(a,olda);b=safe_add(b,oldb);c=safe_add(c,oldc);d=safe_add(d,oldd);}
      return Array(a,b,c,d);}
    return binl2rstr(binl_md5(rstr2binl(input),input.length*8));}
  jabberwerx.util.crypto.generateUUID=function(){var parts=[];for(var idx=0;idx<16;idx++){parts[idx]=Math.floor(Math.random()*256);}
    parts[6]=(parts[6]&0x0f)|0x40;parts[8]=(parts[8]&0x3f)|0x80;var result="";for(var idx=0;idx<parts.length;idx++){var val=parts[idx];if(idx==4||idx==6||idx==8||idx==10){result+="-";}
      result+=((val>>>4)&0x0f).toString(16);result+=(val&0x0f).toString(16);}
    return result;}})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Rendezvous.js*/
;(function(jabberwerx){jabberwerx.Rendezvousable={startRendezvous:function(ctx){this._rendezvousCtx=ctx;return false;},finishRendezvous:function(){this._rendezvousCtx&&this._rendezvousCtx.finish(this);delete this._rendezvousCtx;},rendezvousContext:null};jabberwerx.Rendezvous=jabberwerx.JWModel.extend({init:function(cb){this._super();if(!(cb&&jabberwerx.$.isFunction(cb))){throw new TypeError("cb must be a function");}
  this._callback=cb;},start:function(rnz){this._ready=true;if(jabberwerx.$.inArray(rnz,this._rendezvousers)!=-1){return true;}
  if(rnz.startRendezvous&&rnz.startRendezvous(this)){this._rendezvousers.push(rnz);return true;}
  return false;},finish:function(rnz){var pos=rnz?jabberwerx.$.inArray(rnz,this._rendezvousers):-1;if(pos!=-1){this._rendezvousers.splice(pos,1);}
  if(this._ready&&!this._rendezvousers.length){this._callback(this);this._ready=false;}
  return(pos!=-1);},isRunning:function(){return this._ready&&(this._rendezvousers.length>0);},_ready:false,_rendezvousers:[]},"jabberwerx.Rendezvous");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/SASL.js*/
;(function(jabberwerx){jabberwerx.SASLMechanism=jabberwerx.JWBase.extend({init:function(client,encoded){this._super();this.mechanismName=this.constructor.mechanismName;this._encoded=Boolean(encoded);if(!(client&&client instanceof jabberwerx.Client)){throw new TypeError("client must be a jabberwerx.Client");}
  this.client=client;},evaluate:function(input){if(input&&!jabberwerx.isElement(input)){throw new TypeError("input must be undefined or an element");}
  var output=null;var failure=null;var data;if(!input){if(this.started){jabberwerx.util.debug.log("SASL mechanism already started!");throw this._handleFailure();}
    this.started=true;try{data=this.evaluateStart();data=this._encodeData(data);output=new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}auth").attribute("mechanism",this.mechanismName).text(data).data;}catch(ex){jabberwerx.util.debug.log("SASL failed to initialize: "+ex);throw this._handleFailure(ex);}}else{if(!this.started){jabberwerx.util.debug.log("SASL mechanism not yet started!");throw this._handleFailure();}
    switch(input.nodeName){case"success":try{if(!this.complete){data=jabberwerx.$(input).text();data=this._decodeData(data);data=this.evaluateChallenge(data);}}catch(ex){jabberwerx.util.debug.log("SASL failed to evaluate success data: "+ex);throw this._handleFailure(ex);}
      if(data||!this.complete){jabberwerx.util.debug.log("SASL failed to complete upon <success/>");throw this._handleFailure();}
      break;case"failure":{var failure=this._handleFailure(jabberwerx.$(input).children().get(0));jabberwerx.util.debug.log("SASL failure from server: "+failure.message);throw failure;}
      break;case"challenge":if(this.complete){jabberwerx.util.debug.log("SASL received challenge after completion!");throw this._handleFailure();}
      try{data=jabberwerx.$(input).text();data=this._decodeData(data);data=this.evaluateChallenge(data);data=this._encodeData(data);output=new jabberwerx.NodeBuilder("{urn:ietf:params:xml:ns:xmpp-sasl}response").text(data).data;}catch(ex){jabberwerx.util.debug.log("SASL failed to evaluate challenge data: "+ex);throw this._handleFailure(ex);}
      break;default:jabberwerx.util.debug.log("unexpected stanza received!");throw this._handleFailure();break;}}
  return output;},_decodeData:function(data){if(!data){return"";}
  if(!this._encoded){return jabberwerx.util.crypto.utf8Decode(jabberwerx.util.crypto.b64Decode(data));}
  return data;},_encodeData:function(data){if(!data){return"";}
  if(!this._encoded){return jabberwerx.util.crypto.b64Encode(jabberwerx.util.crypto.utf8Encode(data));}
  return data;},evaluateStart:function(){throw new Error("not implemented!");},evaluateChallenge:function(inb){throw new Error("not implemented!");},_handleFailure:function(cond){this.complete=true;if(cond instanceof jabberwerx.SASLMechanism.SASLAuthFailure){return cond;}else if(jabberwerx.isElement(cond)){var msg="{urn:ietf:params:xml:ns:xmpp-sasl}"+cond.nodeName;return new jabberwerx.SASLMechanism.SASLAuthFailure(msg);}else{return new jabberwerx.SASLMechanism.SASLAuthFailure();}},getProperties:function(){return(this.client&&this.client._connectParams)||{};},client:null,mechanismName:"",complete:false,started:false},"jabberwerx.SASLMechanism");jabberwerx.SASLMechanism.SASLAuthFailure=jabberwerx.util.Error.extend("{urn:ietf:params:xml:ns:xmpp-sasl}temporary-auth-failure");jabberwerx.SASLMechanism._baseExtend=jabberwerx.SASLMechanism.extend;jabberwerx.SASLMechanism.extend=function(props,type,mechname){if(!(mechname&&typeof(mechname)=="string")){throw new TypeError("name must be a non-empty string");}
  var subtype=jabberwerx.SASLMechanism._baseExtend(props,type);subtype.mechanismName=mechname.toUpperCase();if(jabberwerx.sasl&&jabberwerx.sasl instanceof jabberwerx.SASLMechanismFactory){jabberwerx.sasl.addMechanism(subtype);}
  return subtype;};jabberwerx.SASLMechanismFactory=jabberwerx.JWBase.extend({init:function(mechs){this._super();if(!mechs){if(jabberwerx._config.enabledMechanisms){mechs=jabberwerx._config.enabledMechanisms;}else{mechs=[];}}
  this.mechanisms=mechs.concat();},createMechanismFor:function(client,mechs){if(!jabberwerx.$.isArray(mechs)){throw new TypeError("mechs must be an array of mechanism names");}
  if(!(client&&client instanceof jabberwerx.Client)){throw new TypeError("client must be an isntance of jabberwerx.Client");}
  mechs=mechs.concat();for(var idx=0;idx<mechs.length;idx++){mechs[idx]=String(mechs[idx]).toUpperCase();}
  var selected=null;for(var idx=0;!selected&&idx<this.mechanisms.length;idx++){var candidate=this._mechsAvail[this.mechanisms[idx]];if(!candidate){continue;}
    for(var jdx=0;!selected&&jdx<mechs.length;jdx++){if(mechs[jdx]!=candidate.mechanismName){continue;}
      try{selected=new candidate(client);}catch(ex){jabberwerx.util.debug.log("could not create SASLMechanism for "+
        candidate.mechanismName+": "+ex);selected=null;}}}
  return selected;},addMechanism:function(type){if(!(jabberwerx.$.isFunction(type)&&type.mechanismName)){throw new TypeError("type must be the constructor for a SASLMechanism type");}
  this._mechsAvail[type.mechanismName]=type;},removeMechanism:function(type){if(!(jabberwerx.$.isFunction(type)&&type.mechanismName)){throw new TypeError("type must be the constructor for a SASLMechanism type");}
  this._mechsAvail[type.mechanismName]=undefined;delete this._mechsAvail[type.mechanismName];},_mechsAvail:{},mechanisms:[]},"jabberwerx.SASLMechanismFactory");if(!(jabberwerx.sasl&&jabberwerx.sasl instanceof jabberwerx.SASLMechanismFactory)){jabberwerx.sasl=new jabberwerx.SASLMechanismFactory(jabberwerx._config.enabledMechanisms);}})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/SASLMechs.js*/
;(function(jabberwerx){jabberwerx.SASLPlainMechanism=jabberwerx.SASLMechanism.extend({init:function(client){this._super(client);},evaluateStart:function(){var params=this.getProperties();if(!this.client.isSecure()){throw new jabberwerx.SASLMechanism.SASLAuthFailure("{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak");}
  var nilChar=String.fromCharCode(0);var usr=(params&&params.jid&&params.jid.getNode())||"";var pwd=(params&&params.password)||"";return nilChar+usr+nilChar+pwd;},evaluateChallenge:function(inb){if(inb||this.complete){throw new jabberwerx.SASLMechanism.SASLAuthFailure();}
  this.complete=true;}},"jabberwerx.SASLPlainMechanism","PLAIN");jabberwerx.SASLDigestMd5Mechanism=jabberwerx.SASLMechanism.extend({init:function(client){this._super(client);},evaluateStart:function(){this._stage=this._generateResponse;return null;},evaluateChallenge:function(inb){var inprops,outprops;if(this.complete&&!this._stage){return;}
  if(!this._stage){jabberwerx.util.debug.log("DIGEST-MD5 in bad stage");throw new jabberwerx.SASLMechanism.SASLAuthFailure();}
  inprops=this._decodeProperties(inb);outprops=this._stage(inprops);return this._encodeProperties(outprops);},_generateResponse:function(inprops){var params=this.getProperties();var user,pass,domain;user=(params.jid&&params.jid.getNode())||"";domain=(params.jid&&params.jid.getDomain())||"";pass=params.password||"";var realm=inprops.realm||domain;var nonce=inprops.nonce;var nc=inprops.nc||"00000001";var cnonce=this._cnonce((user+"@"+realm).length);var uri="xmpp/"+domain;var qop="auth";var A1;A1=jabberwerx.util.crypto.rstr_md5(jabberwerx.util.crypto.utf8Encode(user+":"+realm+":"+pass));A1=A1+jabberwerx.util.crypto.utf8Encode(":"+nonce+":"+cnonce);var A2;A2=jabberwerx.util.crypto.utf8Encode("AUTHENTICATE:"+uri);var rsp=[jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A1)),nonce,nc,cnonce,qop,jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A2))].join(":");rsp=jabberwerx.util.crypto.hex_md5(jabberwerx.util.crypto.utf8Encode(rsp));var outprops={"charset":"utf-8","digest-uri":uri,"cnonce":cnonce,"nonce":nonce,"nc":nc,"qop":qop,"username":user,"realm":realm,"response":rsp};this._authProps=outprops;this._stage=this._verifyRspAuth;return outprops;},_verifyRspAuth:function(inprops){if(inprops){inprops=jabberwerx.$.extend({},inprops,this._authProps||{});var params=this.getProperties();var user,pass,domain;user=(params.jid&&params.jid.getNode())||"";domain=(params.jid&&params.jid.getDomain())||"";pass=params.password||"";var realm=inprops.realm||domain;var nonce=inprops.nonce;var nc=inprops.nc||"00000001";var cnonce=inprops.cnonce;var uri="xmpp/"+domain;var qop="auth";var A1;A1=jabberwerx.util.crypto.rstr_md5(jabberwerx.util.crypto.utf8Encode(user+":"+realm+":"+pass));A1=A1+jabberwerx.util.crypto.utf8Encode(":"+nonce+":"+cnonce);var A2;A2=jabberwerx.util.crypto.utf8Encode(":"+uri);var rsp=[jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A1)),nonce,nc,cnonce,qop,jabberwerx.util.crypto.str2hex(jabberwerx.util.crypto.rstr_md5(A2))].join(":");rsp=jabberwerx.util.crypto.hex_md5(jabberwerx.util.crypto.utf8Encode(rsp));if(rsp!=inprops.rspauth){jabberwerx.util.debug.log("response auth values do not match");throw new jabberwerx.SASLMechanism.SASLAuthFailure();}}
  this.complete=true;this._stage=null;},_decodeProperties:function(str){var ptn=/([^"()<>\{\}\[\]@,;:\\\/?= \t]+)=(?:([^"()<>\{\}\[\]@,;:\\\/?= \t]+)|(?:"([^"]+)"))/g;var props={};var field;if(!str){str="";}
  while(field=ptn.exec(str)){props[field[1]]=field[2]||field[3]||"";}
  return props;},_encodeProperties:function(props){var quoted={"username":true,"realm":true,"nonce":true,"cnonce":true,"digest-uri":true,"response":true};var tmp=[];for(var name in props){var val=quoted[name]?'"'+props[name]+'"':props[name];tmp.push(name+"="+val);}
  return tmp.join(",");},_stage:null,_cnonce:function(size){var data="";for(var idx=0;idx<size;idx++){data+=String.fromCharCode(Math.random()*256);}
  return jabberwerx.util.crypto.b64Encode(data);}},"jabberwerx.SASLDigestMd5Mechanism","DIGEST-MD5");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Translator.js*/
;(function(jabberwerx){jabberwerx.Translator=jabberwerx.JWBase.extend({init:function(){this._super();},format:function(istr){var ostr=this._updates[istr]||this._mappings[istr];if(!ostr){ostr=istr;}
  var ptn=/\{([0-9]+)\}/g;var args=jabberwerx.$.makeArray(arguments).slice(1);var substFn=function(match,idx){idx=parseInt(idx);if(isNaN(idx)){return match;}
    var found=args[idx];if(found===null||found===undefined){return match;}
    return found;};var ostr=ostr.replace(ptn,substFn);return ostr;},load:function(locale){if(!locale){locale=jabberwerx.system.getLocale();}
  if(this.locale==locale){return;}
  var filterFN=function(l){return function(){var lang=(jabberwerx.$(this).attr("xml:lang")||"").toLowerCase();return(lang==l)?this:null;};};var localeFull=locale.toLowerCase();var localePart=locale.split("-")[0].toLowerCase();var tmpLinks=jabberwerx.$("link[rel='translation'][type='text/javascript']");var links=jabberwerx.$();links=jabberwerx.$.merge(links,tmpLinks.map(filterFN("")));links=jabberwerx.$.merge(links,tmpLinks.map(filterFN(localePart)));links=jabberwerx.$.merge(links,tmpLinks.map(filterFN(localeFull)));if(!links.length){throw new TypeError("no translation links found");}
  var mappings={};var processed=0;links.each(function(){var url=jabberwerx.$(this).attr("href");if(!url){return;}
    var data=null;var completeFn=function(xhr,status){if(status!="success"){return;}
      data=xhr.responseText;};var setup={async:false,cache:true,complete:completeFn,dataType:"text",processData:false,timeout:1000,url:url};jabberwerx.$.ajax(setup);if(!data){jabberwerx.util.debug.log("no translation data returned from "+url);}
    try{data=eval("("+data+")");}catch(ex){jabberwerx.util.debug.log("could not parse translation data from "+url);}
    mappings=jabberwerx.$.extend(mappings,data);processed++;});if(!processed){throw new TypeError("no valid translations found");}
  this._mappings=mappings;this.locale=locale;},addTranslation:function(key,value){if(!(key&&typeof(key)=="string")){throw new TypeError();}
  if(!(value&&typeof(value)=="string")){throw new TypeError();}
  this._updates[key]=value;},removeTranslation:function(key){if(!(key&&typeof(key)=="string")){throw new TypeError();}
  delete this._updates[key];},locale:undefined,_mappings:{},_updates:{}},"jabberwerx.Translator");jabberwerx.l10n=new jabberwerx.Translator();jabberwerx._=(function(l10n){var fn;fn=function(){return l10n.format.apply(l10n,arguments);};fn.instance=l10n;return fn;})(jabberwerx.l10n);try{jabberwerx.l10n.load(jabberwerx.system.getLocale());jabberwerx.util.debug.log("Loaded translation for "+jabberwerx.system.getLocale());}catch(e){jabberwerx.util.debug.log("Could not find a translation for "+jabberwerx.system.getLocale());}})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/JID.js*/
;(function(jabberwerx){var _jidCache={};var _lookupCache=function(val){if(!val){throw new jabberwerx.JID.InvalidJIDError();}
  val=val.toString();var jid=_jidCache[val];if(jid){return jid;}
  var resSep=val.lastIndexOf('/');val=(resSep!=-1)?val.substring(0,resSep).toLowerCase()
    +"/"+val.substring(resSep+1):val.toLowerCase();jid=_jidCache[val];if(jid){return jid;}
  return null;};jabberwerx.JID=jabberwerx.JWModel.extend({init:function(arg){if(arg instanceof jabberwerx.JID){arg={"node":arg.getNode()||null,"domain":arg.getDomain()||null,"resource":arg.getResource()||null};}else if(typeof(arg)=="string"){var result=/^(?:([^\/]+)@)?([^@\/]+)(?:\/(.+))?$/.exec(arg);if(!result){throw new jabberwerx.JID.InvalidJIDError("JID did not match the form 'node@domain/resource'");}
  arg={"node":(result[1]||undefined),"domain":result[2],"resource":(result[3]||undefined)};}else if(!arg){throw new jabberwerx.JID.InvalidJIDError("argument must be defined and not null");}else{arg=jabberwerx.$.extend({},arg);}
  var prepFN=function(test){if(/[ \t\n\r@\:\<\>\&'"\/]/.test(test)){throw new jabberwerx.JID.InvalidJIDError("invalid characters found");}
    return test.toLowerCase();};if(!arg.domain){throw new jabberwerx.JID.InvalidJIDError("'' or null or undefined domain not allowed");}else{arg.domain=prepFN(arg.domain,true);}
  if(arg.node==""){throw new jabberwerx.JID.InvalidJIDError("'' node with @ not allowed");}else if(arg.node){if(arg.unescaped){arg.node=jabberwerx.JID.escapeNode(arg.node);}
    arg.node=prepFN(arg.node,true);}
  if(arg.resouce==""){throw new jabberwerx.JID.InvalidJIDError("'' resource with / not allowed");}
  this._domain=arg.domain;this._node=arg.node||"";this._resource=arg.resource||"";this._full=""+
    (arg.node?arg.node+"@":"")+
    arg.domain+
    (arg.resource?"/"+arg.resource:"");if(!_jidCache[this.toString()]){_jidCache[this.toString()]=this;}},getBareJID:function(){if(!this.getResource()){return this;}else{return new jabberwerx.JID({"node":this.getNode(),"domain":this.getDomain()});}},getBareJIDString:function(){return this.getBareJID().toString();},getDomain:function(){return this._domain;},getNode:function(){return this._node;},getResource:function(){return this._resource;},toString:function(){return this._full;},toDisplayString:function(){var result=this.getDomain();var part;part=this.getNode();if(part){result=jabberwerx.JID.unescapeNode(part)+"@"+result;}
  part=this.getResource();if(part){result=result+"/"+part;}
  return result;},equals:function(jid){try{jid=jabberwerx.JID.asJID(jid);return this.toString()==jid.toString();}catch(ex){return false;}},compareTo:function(jid){jid=jabberwerx.JID.asJID(jid);var cmp=function(v1,v2){if(v1<v2){return-1;}else if(v1>v2){return 1;}
  return 0;};var result;if((result=cmp(this.getDomain(),jid.getDomain()))!=0){return result;}
  if((result=cmp(this.getNode(),jid.getNode()))!=0){return result;}
  if((result=cmp(this.getResource(),jid.getResource()))!=0){return result;}
  return 0;},shouldBeSerializedInline:function(){return false;},wasUnserialized:function(){_jidCache[this.toString()]=this;},_node:"",_domain:"",_resource:"",_full:""},'jabberwerx.JID');jabberwerx.JID.InvalidJIDError=jabberwerx.util.Error.extend.call(TypeError,"The JID is invalid");jabberwerx.JID.asJID=function(val){var jid=null;if(val instanceof jabberwerx.JID){return val;}
  jid=_lookupCache(val);if(!jid){jid=new jabberwerx.JID(val);var lookup=jid.toString();if(_jidCache[lookup]&&_jidCache[lookup]!=jid){jid=_jidCache[lookup];}else{_jidCache[lookup]=jid;}
    _jidCache[val.toString()]=jid;}
  return jid;};jabberwerx.JID.clearCache=function(){_jidCache={};},jabberwerx.JID.escapeNode=function(input){if(typeof(input)!="string"){throw new TypeError("input must be a string");}
  if(input.charAt(0)==' '||input.charAt(input.length-1)==' '){throw new TypeError("input cannot start or end with ' '");}
  var ptn=/([ "&'\/:<>@])|(\\)(20|22|26|27|2f|3a|3c|3e|40|5c)/gi;var repFN=function(found,m1,m2,m3){switch(m1||m2){case' ':return"\\20";case'"':return"\\22";case'&':return"\\26";case'\'':return"\\27";case'/':return"\\2f";case':':return"\\3a";case'<':return"\\3c";case'>':return"\\3e";case'@':return"\\40";case'\\':return"\\5c"+m3;}
    return found;};return input.replace(ptn,repFN);};jabberwerx.JID.unescapeNode=function(input){if(typeof(input)!="string"){throw new TypeError("input must be a string");}
  var ptn=/(\\20|\\22|\\26|\\27|\\2f|\\3a|\\3c|\\3e|\\40|\\5c)/gi;var repFN=function(found,m1){switch(m1){case"\\20":return' ';case"\\22":return'"';case"\\26":return'&';case"\\27":return'\'';case"\\2f":return'/';case"\\3a":return':';case"\\3c":return'<';case"\\3e":return'>';case"\\40":return'@';case"\\5c":return'\\';}
    return found;};return input.replace(ptn,repFN);};var tjid=jabberwerx.JID.asJID("foo");if((tjid+"")!=="foo"){jabberwerx.JID.prototype.toString=function(){return this._full||"";};}})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Events.js*/
;(function(jabberwerx){var _jwaNotifierBinding=function(dispatch,name,mode){var key='on:'+name.toLowerCase();var notifier=dispatch[key];if(!notifier&&(mode=='create')){notifier=new jabberwerx.EventNotifier(dispatch,name);dispatch[key]=notifier;}else if(notifier&&(mode=='destroy')){delete dispatch[key];}
  return notifier;};var _jwaDispatchBinding=function(src,name,mode){var dispatch=(src instanceof jabberwerx.EventDispatcher)?src:src._eventDispatch;if(!(dispatch&&dispatch instanceof jabberwerx.EventDispatcher)){if(mode!='create'){return;}
  dispatch=new jabberwerx.EventDispatcher(src);src._eventDispatch=dispatch;}
  return _jwaNotifierBinding(dispatch,name,mode);};jabberwerx.EventObject=function(notifier,data){this.notifier=notifier;this.name=notifier.name;this.source=notifier.dispatcher.source;this.data=data;this.selected=undefined;};jabberwerx.EventNotifier=jabberwerx.JWBase.extend({init:function(dispatcher,name){this._super();this.dispatcher=dispatcher;this.name=name.toLowerCase();this._callbacks=[];},bind:function(cb){this.bindWhen(undefined,cb);},bindWhen:function(selector,cb){if(!jabberwerx.$.isFunction(cb)){new TypeError("callback must be a function");}
  this.unbind(cb);switch(typeof selector){case'undefined':break;case'function':break;case'string':var filter=selector;selector=function(data,evt){var node;if(data instanceof jabberwerx.Stanza){node=data.getDoc();}else{node=data;}
    var selected=jabberwerx.$(filter,node);switch(selected.length){case 0:return false;case 1:return selected[0];default:return selected;}
    return false;};break;default:throw new TypeError("selector must be undefined or function or string");}
  this._callbacks.push({'filter':filter,'selector':selector,'cb':cb});},unbind:function(cb){this._callbacks=jabberwerx.$.grep(this._callbacks,function(value){return value['cb']!==cb;});},trigger:function(data,delegated,cb){var evt;if(data instanceof jabberwerx.EventObject){evt=data;evt.notifier=this;}else{evt=new jabberwerx.EventObject(this,data);}
  if(!delegated){delegated=_jwaNotifierBinding(jabberwerx.globalEvents,this.name);}else if(!(delegated instanceof jabberwerx.EventNotifier)){throw new TypeError("delegated must be a EventNotifier");}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("cb must be a function");}
  return this.dispatcher.process(this,evt,delegated,cb);},process:function(evt,delegated,cb){var results=false;jabberwerx.reduce(this._callbacks,function(item){var cb=item['cb'];var filter=item['selector'];var retval;if(!cb||!jabberwerx.$.isFunction(cb)){return;}
  var selected=undefined;if(filter){selected=filter(evt.data);if(!selected){return;}}
  try{evt.selected=selected;retval=cb.call(cb,evt);}catch(ex){}
  if(retval!==undefined){results=results||Boolean(retval);}});if(delegated&&delegated!==this){var fn=function(delegatedResults){results=results||delegatedResults;if(cb){cb(results);}};delegated.trigger(evt,null,fn);}else if(cb){cb(results);}},shouldBeSavedWithGraph:function(){return true;},wasUnserialized:function(){var callbacks=this._callbacks;callbacks=jabberwerx.$.map(callbacks,function(oneCB,oneKey){if(jabberwerx.util.isJWInvocation(oneCB.cb)){var method=oneCB.cb.methodName,target=oneCB.cb.object;if(!(target&&method&&target[method])){jabberwerx.util.debug.log("throwing out bad callback: "+target+"["+method+"]");return null;}}
  if(oneCB.filter&&!oneCB.selector&&(typeof oneCB.filter=='string')){var oneFilter=oneCB.filter;oneCB.selector=function(data,evt){var node;if(data instanceof jabberwerx.Stanza){node=data.getDoc();}else{node=data;}
    var selected=jabberwerx.$(oneFilter,node);switch(selected.length){case 0:return false;case 1:return selected[0];default:return selected;}
    return false;};}
  return oneCB;});this._callbacks=callbacks;}},"jabberwerx.EventNotifier");jabberwerx.EventDispatcher=jabberwerx.JWBase.extend({init:function(src){this._super();this.source=src;if(src!==jabberwerx&&jabberwerx.globalEvents){this.globalEvents=jabberwerx.globalEvents;}},process:function(notifier,evt,delegated,cb){var op={notifier:notifier,event:evt,delegated:delegated,callback:cb};if(this._queue){this._queue.push(op);return;}
  this._queue=[op];while(op=this._queue.shift()){op.notifier.process(op.event,op.delegated,op.callback);}
  delete this._queue;},shouldBeSavedWithGraph:function(){return true;},wasUnserialized:function(){jabberwerx.globalEvents=this.globalEvents;}},"jabberwerx.EventDispatcher");jabberwerx.GlobalEventDispatcher=jabberwerx.EventDispatcher.extend({init:function(){this._super(jabberwerx);if(jabberwerx.globalEvents&&jabberwerx.globalEvents!==this){throw new Error("only one global events dispatcher can exist!");}},bind:function(name,cb){var notifier=_jwaNotifierBinding(this,name,'create');notifier.bind(cb);},bindWhen:function(name,selector,cb){var notifier=_jwaNotifierBinding(this,name,'create');notifier.bindWhen(selector,cb);},unbind:function(name,cb){var notifier=_jwaNotifierBinding(this,name);if(notifier){notifier.unbind(cb);}},shouldBeSerializedInline:function(){return false;},shouldBeSavedWithGraph:function(){return true;},willBeSerialized:function(){this.source=undefined;},wasUnserialized:function(){this.source=jabberwerx;}},"jabberwerx.GlobalEventDispatcher");if(!(jabberwerx.globalEvents&&jabberwerx.globalEvents instanceof jabberwerx.GlobalEventDispatcher)){jabberwerx.globalEvents=new jabberwerx.GlobalEventDispatcher();}
  jabberwerx.JWModel.prototype.event=function(name){return _jwaDispatchBinding(this,name);};jabberwerx.JWModel.prototype.applyEvent=function(name){return _jwaDispatchBinding(this,name,'create');};})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Entity.js*/
;(function(jabberwerx){var __jwesAsKey=function(jid,node){return"["+(jid||"")+"]:["+(node||"")+"]";};jabberwerx.Entity=jabberwerx.JWModel.extend({init:function(key,ctrl){this._super();if(!key&&!(key.jid||key.node)){throw new TypeError("key must contain a jid and/or a node");}
  if(key.jid){this.jid=jabberwerx.JID.asJID(key.jid);}
  if(key.node){this.node=key.node;}
  this._mapKey=__jwesAsKey(this.jid,this.node);var cache;if(ctrl instanceof jabberwerx.Controller){this.controller=ctrl;cache=ctrl.client&&ctrl.client.entitySet;}else if(ctrl&&ctrl.register&&ctrl.unregister&&ctrl.entity){cache=ctrl;}
  if(cache){this.cache=cache;this._eventing={"added":cache.event("entityCreated"),"updated":cache.event("entityUpdated"),"deleted":cache.event("entityDestroyed")};}else{this._eventing={"added":null,"updated":null,"deleted":null};}
  this.applyEvent('primaryPresenceChanged');this.applyEvent("resourcePresenceChanged");},destroy:function(){if(this.cache){this.cache.unregister(this);}
  this._super();},apply:function(entity,noupdate){if(!(entity&&entity instanceof jabberwerx.Entity)){throw new TypeError("entity is not valid");}
  jabberwerx.$.extend(this,{_displayName:entity._displayName,_groups:jabberwerx.$.extend([],entity._groups),_presenceList:jabberwerx.$.extend([],entity._presenceList),properties:jabberwerx.$.extend(true,{},entity.properties),features:jabberwerx.$.extend([],entity.features),identities:jabberwerx.$.extend([],entity.identities)});if(!noupdate){this.update();}
  return this;},__toStringValue:function(){return"entity<"+this.getClassName()+">["+
  this._mapKey+"]: "+
  this.getDisplayName();},matches:function(entity){if(entity===this){return true;}
  if(!entity){return false;}
  return this._mapKey==entity._mapKey;},isActive:function(){return(this._presenceList.length>0&&this._presenceList[0].getType()!="unavailable");},getPrimaryPresence:function(){return this._presenceList[0]||null;},getAllPresence:function(){return this._presenceList;},getResourcePresence:function(resource){var fullJid=this.jid.getBareJIDString()+'/'+resource;var presence=null;jabberwerx.$.each(this._presenceList,function(){if(this.getFrom()==fullJid){presence=this;return false;}
  return true;});return presence;},updatePresence:function(presence,quiet){var retVal=false;if(!presence){if(this.getPrimaryPresence()){var len=this._presenceList.length;for(var i=0;i<len;i++){var tpres=this._presenceList.pop();!quiet&&this.event("resourcePresenceChanged").trigger({fullJid:tpres.getFromJID(),presence:null,nowAvailable:false});}!quiet&&this.event("primaryPresenceChanged").trigger({presence:null,fullJid:this.jid.getBareJID()});retVal=true;}}else{if(!(presence instanceof jabberwerx.Presence)){throw new TypeError("presence is not a valid type");}
  var jid=presence.getFromJID();if(jid.getBareJIDString()!=this.jid.getBareJIDString()){throw new jabberwerx.Entity.InvalidPresenceError("presence is not for this entity: "+this);}
  if(presence.getType()&&presence.getType()!="unavailable"){throw new jabberwerx.Entity.InvalidPresenceError("presence is not the correct type");}
  var resPresence=this.getResourcePresence(jid.getResource());var nowAvailable;if(!resPresence||resPresence.getType()=="unavailable"){nowAvailable=Boolean(!presence.getType());}else{nowAvailable=false;}
  var primaryPresence=this._presenceList[0]||null;this._removePresenceFromList(jid.toString());if(presence.getType()!="unavailable"){if(!this.isActive()){this._clearPresenceList();}
    this._insertPresence(presence);}else{this._handleUnavailable(presence);}!quiet&&this.event("resourcePresenceChanged").trigger({fullJid:jid,presence:presence,nowAvailable:nowAvailable});if(primaryPresence!==this._presenceList[0]){var primaryJid;primaryPresence=this._presenceList[0]||null;primaryJid=primaryPresence?primaryPresence.getFromJID():jid.getBareJID();!quiet&&this.event("primaryPresenceChanged").trigger({presence:primaryPresence,fullJid:primaryJid});retVal=true;}}
  return retVal;},_handleUnavailable:function(presence){},_insertPresence:function(presence){var ipos;for(ipos=0;(ipos<this._presenceList.length)&&(presence.compareTo(this._presenceList[ipos])<0);++ipos);this._presenceList.splice(ipos,0,presence);},_clearPresenceList:function(){this._presenceList=[];},_removePresenceFromList:function(jid){for(var i=0;i<this._presenceList.length;i++){if(this._presenceList[i].getFrom()==jid){this._presenceList.splice(i,1);return true;}}
  return false;},getDisplayName:function(){var name=this._displayName;if(!name){var jid=(this.jid&&this.jid.toDisplayString());name=(this.node?"{"+this.node+"}":"")+(jid||"");}
  return name;},setDisplayName:function(name){var nval=(String(name)||"");var oval=this._displayName;if(oval!=nval){this._displayName=nval;this.update();}},_displayName:"",getGroups:function(){return this._groups;},setGroups:function(groups){if(jabberwerx.$.isArray(groups)){groups=jabberwerx.unique(groups.concat([]));}else if(groups){groups=[groups.toString()];}else{groups=[];}
  this._groups=groups;this.update();},_groups:[],update:function(){if(this.controller&&this.controller.updateEntity){this.controller.updateEntity(this);}else if(this._eventing["updated"]){this._eventing["updated"].trigger(this);}},remove:function(){if(this.controller&&this.controller.removeEntity){this.controller.removeEntity(this);}else{this.destroy();}},hasFeature:function(feat){if(!feat){return false;}
  var result=false;jabberwerx.$.each(this.features,function(){result=String(this)==feat;return!result;});return result;},hasIdentity:function(id){if(!id){return false;}
  var result=false;jabberwerx.$.each(this.identities,function(){result=String(this)==id;return!result;});return result;},toString:function(){return this.__toStringValue();},jid:null,node:"",properties:{},features:[],identities:[],_presenceList:[]},'jabberwerx.Entity');jabberwerx.Entity.InvalidPresenceError=jabberwerx.util.Error.extend("The provided presence is not valid for this entity");jabberwerx.EntitySet=jabberwerx.JWModel.extend({init:function(){this._super();this.applyEvent("entityCreated");this.applyEvent("entityDestroyed");this.applyEvent("entityUpdated");this.applyEvent("entityRenamed");this.applyEvent("entityAdded");this.applyEvent("entityRemoved");this.applyEvent("batchUpdateStarted");this.applyEvent("batchUpdateEnded");},entity:function(jid,node){return this._map[__jwesAsKey(jid,node)];},register:function(entity){if(!(entity&&entity instanceof jabberwerx.Entity)){throw new TypeError("entity is not an Entity");}
  var prev=this.entity(entity.jid,entity.node);if(prev===entity){return false;}
  if(prev){this.unregister(prev);}
  this._updateToMap(entity);this.event("entityAdded").trigger(entity);return true;},unregister:function(entity){var present=(this.entity(entity.jid,entity.node)!==undefined);this._removeFromMap(entity);if(present){this.event("entityRemoved").trigger(entity);}
  return present;},_renameEntity:function(entity,njid,nnode){var ojid=entity.jid;var onode=entity.node;this._removeFromMap(entity);if(njid){njid=jabberwerx.JID.asJID(njid);}else{njid=undefined;}
  entity.jid=njid;if(nnode){nnode=String(nnode);}else{nnode=undefined;}
  entity.node=nnode;this._updateToMap(entity);var data={entity:entity,jid:ojid,node:nnode};this.event("entityRenamed").trigger(data);},each:function(op,entityClass){if(!jabberwerx.$.isFunction(op)){throw new TypeError('operator must be a function');}
  var that=this;jabberwerx.$.each(this._map,function(){var retcode;if(this instanceof(entityClass||jabberwerx.Entity)){retcode=op(this);}
    return(retcode!=false);});},toArray:function(){var arr=[];this.each(function(entity){arr.push(entity);});return arr;},getAllGroups:function(){var groups=[];this.each(function(entity){jabberwerx.$.merge(groups,entity.getGroups());});return jabberwerx.unique(groups);},_map:{},_updateToMap:function(ent){var key=__jwesAsKey(ent.jid,ent.node);ent._mapKey=key;this._map[key]=ent;},_removeFromMap:function(ent){delete this._map[__jwesAsKey(ent.jid,ent.node)];},_batchCount:0,_batchQueue:[],startBatch:function(){var count=this._batchCount;this._batchCount++;if(count==0){this._enableBatchTriggers(true);this._batchQueue=[];this.event("batchUpdateStarted").trigger();}
  return(count!=0);},endBatch:function(){var running=true;switch(this._batchCount){case 0:running=false;break;case 1:running=false;this._enableBatchTriggers(false);var bq=this._batchQueue;this._batchQueue=[];this.event("batchUpdateEnded").trigger(bq);default:this._batchCount--;break;}
  return running;},_addBatchedEvent:function(notifier,edata){this._batchQueue.push({name:notifier.name,data:edata});},_enableBatchTriggers:function(enable){var that=this;jabberwerx.$.each(["entityCreated","entityDestroyed","entityRenamed","entityUpdated","entityAdded","entityRemoved"],function(){var notifier=that.event(this);if(!enable&&notifier._superTrigger){notifier.trigger=notifier._superTrigger;delete notifier._superTrigger;}else if(enable&&!notifier._superTrigger){notifier._superTrigger=notifier.trigger;notifier.trigger=function(data){that._addBatchedEvent(notifier,data);return(!that.suppressBatchedEvents&&notifier._superTrigger.apply(notifier,arguments));}}});},suppressBatchedEvents:false},'jabberwerx.EntitySet');jabberwerx.EntitySet.EntityAlreadyExistsError=jabberwerx.util.Error.extend('That JID is already taken!.');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Stanza.js*/
;(function(jabberwerx){jabberwerx.Stanza=jabberwerx.JWModel.extend({init:function(root){this._super();var builder=new jabberwerx.NodeBuilder();if(jabberwerx.isElement(root)){builder=builder.node(root);}else if(typeof(root)=="string"){if(!(/^\{[^\}]*\}/.test(root))){root="{jabber:client}"+root;}
  builder=builder.element(root);}else{throw new TypeError("root must be an element or expanded-name");}
  this._DOM=builder.data;var date=new Date();var dateString=jabberwerx.$(builder.data).find("delay[xmlns='urn:xmpp:delay'][stamp]").attr("stamp");if(!dateString){dateString=jabberwerx.$(builder.data).find("x[xmlns='jabber:x:delay'][stamp]").attr("stamp");}
  if(dateString){try{date=jabberwerx.parseTimestamp(dateString);}catch(ex){jabberwerx.util.debug.log("could not parse delay: "+ex);}}
  this.timestamp=date;},getNode:function(){return this._DOM;},getDoc:function(){return this.getNode().ownerDocument;},xml:function(){return jabberwerx.util.serializeXML(this._DOM);},pType:function(){return this.getNode().nodeName;},_getAttrValue:function(name){return this.getNode().getAttribute(name);},_setAttrValue:function(name,val){if(val===undefined||val===null){this.getNode().removeAttribute(name);}else{this.getNode().setAttribute(name,val);}},_getChildText:function(name){var nnode=new jabberwerx.NodeBuilder(name).data;var nodens=(nnode.namespaceURI)?nnode.namespaceURI:this.getNode().namespaceURI;var matches=jabberwerx.$(this.getNode()).children(nnode.nodeName).map(function(idx,child){return child.namespaceURI==nodens?child:null;});return matches.length?jabberwerx.$(matches[0]).text():null;},_setChildText:function(name,val){var n=jabberwerx.$(this.getNode()).children(name);if(val===undefined||val===null){n.remove();}else{if(!n.length){n=jabberwerx.$(new jabberwerx.NodeBuilder(this.getNode()).element(name).data);}
  n.text(val);}},getType:function(){return this._getAttrValue("type");},setType:function(type){this._setAttrValue("type",type||undefined);},getID:function(){return this._getAttrValue("id");},setID:function(id){this._setAttrValue("id",id||undefined);},getFrom:function(){return this._getAttrValue("from")||null;},getFromJID:function(){var addr=this.getFrom();if(addr){try{addr=jabberwerx.JID.asJID(addr);}catch(ex){jabberwerx.util.debug.log("could not parse 'from' address: "+ex);addr=null;}}
  return addr;},setFrom:function(addr){addr=(addr)?jabberwerx.JID.asJID(addr):undefined;this._setAttrValue("from",addr);},getTo:function(){return this._getAttrValue("to")||null;},getToJID:function(){var addr=this.getTo();if(addr){try{addr=jabberwerx.JID.asJID(addr);}catch(ex){jabberwerx.util.debug.log("could not parse 'to' address: "+ex);addr=null;}}
  return addr;},setTo:function(addr){addr=(addr)?jabberwerx.JID.asJID(addr):undefined;this._setAttrValue("to",addr);},isError:function(){return this.getType()=="error";},getErrorInfo:function(){var err=jabberwerx.$(this.getNode()).children("error");if(this.isError()&&err.length){err=jabberwerx.Stanza.ErrorInfo.createWithNode(err.get(0));}else{err=null;}
  return err;},clone:function(){var cpy=jabberwerx.Stanza.createWithNode(this.getNode());cpy.timestamp=this.timestamp;return cpy;},swap:function(include_from){var cpy=this.clone();cpy.setTo(this.getFromJID());cpy.setFrom(include_from?this.getToJID():null);return cpy;},errorReply:function(err){if(!(err&&err instanceof jabberwerx.Stanza.ErrorInfo)){throw new TypeError("err must be an ErrorInfo");}
  var retval=this.swap();retval.setType("error");var builder=new jabberwerx.NodeBuilder(retval.getNode()).xml(err.getNode().xml);return retval;},willBeSerialized:function(){this.timestamp=this.timestamp.getTime();this._serializedXML=this._DOM.xml;delete this._DOM;},wasUnserialized:function(){if(this._serializedXML&&this._serializedXML.length){this._DOM=jabberwerx.util.unserializeXML(this._serializedXML);delete this._serializedXML;}
  this.timestamp=this.timestamp?new Date(this.timestamp):new Date();},timestamp:null,_DOM:null},"jabberwerx.Stanza");jabberwerx.Stanza.generateID=function(){return jabberwerx.util.crypto.b64_sha1(jabberwerx.util.crypto.generateUUID());};jabberwerx.Stanza.ErrorInfo=jabberwerx.JWModel.extend({init:function(type,cond,text){this._super();this.type=type||"wait";this.condition=cond||"{urn:ietf:params:xml:ns:xmpp-stanzas}internal-server-error";this.text=text||"";this.toString=this._toErrString;},getNode:function(){var builder=new jabberwerx.NodeBuilder("error");builder.attribute("type",this.type);builder.element(this.condition);if(this.text){builder.element("{urn:ietf:params:xml:ns:xmpp-stanzas}text").text(this.text);}
  return builder.data;},wasUnserialized:function(){this.toString=this._toErrString;},_toErrString:function(){return this.condition;},type:"",condition:"",text:""},"jabberwerx.Stanza.ErrorInfo");jabberwerx.Stanza.ErrorInfo.createWithNode=function(node){if(!jabberwerx.isElement(node)){throw new TypeError("node must be an Element");}
  node=jabberwerx.$(node);var type=node.attr("type");var cond=node.children("[xmlns='urn:ietf:params:xml:ns:xmpp-stanzas']:not(text)").map(function(){return"{urn:ietf:params:xml:ns:xmpp-stanzas}"+this.nodeName;}).get(0);var text=node.children("text[xmlns='urn:ietf:params:xml:ns:xmpp-stanzas']").text();return new jabberwerx.Stanza.ErrorInfo(type,cond,text);};jabberwerx.Stanza.ERR_BAD_REQUEST=new jabberwerx.Stanza.ErrorInfo("modify","{urn:ietf:params:xml:ns:xmpp-stanzas}bad-request");jabberwerx.Stanza.ERR_CONFLICT=new jabberwerx.Stanza.ErrorInfo("modify","{urn:ietf:params:xml:ns:xmpp-stanzas}conflict");jabberwerx.Stanza.ERR_FEATURE_NOT_IMPLEMENTED=new jabberwerx.Stanza.ErrorInfo("cancel","{urn:ietf:params:xml:ns:xmpp-stanzas}feature-not-implemented");jabberwerx.Stanza.ERR_FORBIDDEN=new jabberwerx.Stanza.ErrorInfo("auth","{urn:ietf:params:xml:ns:xmpp-stanzas}forbidden");jabberwerx.Stanza.ERR_INTERNAL_SERVER_ERROR=new jabberwerx.Stanza.ErrorInfo("wait","{urn:ietf:params:xml:ns:xmpp-stanzas}internal-server-error");jabberwerx.Stanza.ERR_ITEM_NOT_FOUND=new jabberwerx.Stanza.ErrorInfo("cancel","{urn:ietf:params:xml:ns:xmpp-stanzas}item-not-found");jabberwerx.Stanza.ERR_JID_MALFORMED=new jabberwerx.Stanza.ErrorInfo("modify","{urn:ietf:params:xml:ns:xmpp-stanzas}jid-malformed");jabberwerx.Stanza.ERR_NOT_ACCEPTABLE=new jabberwerx.Stanza.ErrorInfo("modify","{urn:ietf:params:xml:ns:xmpp-stanzas}not-acceptable");jabberwerx.Stanza.ERR_NOT_ALLOWED=new jabberwerx.Stanza.ErrorInfo("cancel","{urn:ietf:params:xml:ns:xmpp-stanzas}not-allowed");jabberwerx.Stanza.ERR_NOT_AUTHORIZED=new jabberwerx.Stanza.ErrorInfo("auth","{urn:ietf:params:xml:ns:xmpp-stanzas}not-authorized");jabberwerx.Stanza.ERR_SERVICE_UNAVAILABLE=new jabberwerx.Stanza.ErrorInfo("wait","{urn:ietf:params:xml:ns:xmpp-stanzas}service-unavailable");jabberwerx.Stanza.ERR_REMOTE_SERVER_TIMEOUT=new jabberwerx.Stanza.ErrorInfo("wait","{urn:ietf:params:xml:ns:xmpp-stanzas}remote-server-timeout");jabberwerx.Stanza.createWithNode=function(node){if(!jabberwerx.isElement(node)){throw new TypeError("node must be an element");}
  var stanza;switch(node.nodeName){case"iq":stanza=new jabberwerx.IQ(node);break;case"message":stanza=new jabberwerx.Message(node);break;case"presence":stanza=new jabberwerx.Presence(node);break;default:stanza=new jabberwerx.Stanza(node);break;}
  return stanza;};jabberwerx.IQ=jabberwerx.Stanza.extend({init:function(packet){if(packet){if(!jabberwerx.isElement(packet)){throw new TypeError("packet must be an &lt;iq/&gt; Element");}
  if(packet.nodeName!="iq"){throw new TypeError("packet must be an &lt;iq/&gt; Element");}}
  this._super(packet||"{jabber:client}iq");},getQuery:function(){return jabberwerx.$(this.getNode()).children(":not(error)").get(0);},setQuery:function(payload){if(payload&&!jabberwerx.isElement(payload)){throw new TypeError("Node must be an element");}
  var q=jabberwerx.$(this.getNode()).children(":not(error)");q.remove();if(payload){new jabberwerx.NodeBuilder(this.getNode()).node(payload);}},reply:function(payload){var retval=this.swap();try{jabberwerx.$(retval.getNode()).empty();}catch(ex){var n=retval.getNode();for(var idx=0;idx<n.childNodes.length;idx++){n.removeChild(n.childNodes[idx]);}}
  if(payload){var builder=new jabberwerx.NodeBuilder(retval.getNode());if(jabberwerx.isElement(payload)){builder.node(payload);}else if(typeof(payload)=="string"){builder.xml(payload);}else{throw new TypeError("payload must be an Element or XML representation of an Element");}}
  retval.setType("result");return retval;}},"jabberwerx.IQ");jabberwerx.Message=jabberwerx.Stanza.extend({init:function(packet){if(packet){if(!jabberwerx.isElement(packet)){throw new TypeError("Must be a <message/> element");}
  if(packet.nodeName!="message"){throw new TypeError("Must be a <message/> element");}}
  this._super(packet||"{jabber:client}message");},getBody:function(){return this._getChildText("body");},setBody:function(body){this.setHTML();this._setChildText("body",body||undefined);},getHTML:function(){var ret=jabberwerx.$(this.getNode()).find("html[xmlns='http://jabber.org/protocol/xhtml-im']>body[xmlns='http://www.w3.org/1999/xhtml']:first");if(ret.length&&!this._isSanitized){this.setHTML(ret.children().get());return this.getHTML();}
  return ret.length?ret.get(0):null;},setHTML:function(html){var htmlNode;if(html&&!jabberwerx.util.isString(html)&&!jabberwerx.isElement(html)&&(!jabberwerx.$.isArray(html)||!html.length)){throw new TypeError("html must be a string, DOM or an array");}
  this._isSanitized=false;var htmlNode=jabberwerx.$(this.getNode()).find("html[xmlns='http://jabber.org/protocol/xhtml-im']");if(htmlNode){htmlNode.remove();}
  this._setChildText("body",null);if(html){htmlNode=html;if(jabberwerx.util.isString(html)){try{htmlNode=jabberwerx.util.unserializeXML(html);}catch(ex){jabberwerx.util.debug.log("setHTML could not parse: '"+html+"'");throw ex;}}
    if(jabberwerx.$.isArray(html)||htmlNode.nodeName!="body")
    {var newBodyBuilder=new jabberwerx.NodeBuilder("{http://www.w3.org/1999/xhtml}body");if(jabberwerx.$.isArray(html)){jabberwerx.$.each(html,function(index,item){newBodyBuilder.node(item);});}else if(jabberwerx.util.isString(html)){newBodyBuilder.xml(html);}else{newBodyBuilder.node(html);}
      html=newBodyBuilder.data;}
    jabberwerx.xhtmlim.sanitize(html);html=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/xhtml-im}html").node(html).parent.data;this._setChildText("body",jabberwerx.$(html).text());jabberwerx.$(this.getNode()).append(html);this._isSanitized=true;}},getSubject:function(){return this._getChildText("subject");},setSubject:function(subject){this._setChildText("subject",subject||undefined);},getThread:function(){return this._getChildText("thread")||null;},setThread:function(thread){this._setChildText("thread",thread||undefined);},_isSanitized:false},"jabberwerx.Message");jabberwerx.Message.translate=function(content,displayName){var xep0245Found=false;var textNodeFound=false;var translatedContent=null;var findTextNodes=function(element,displayName){if(!xep0245Found&&!textNodeFound){if(jabberwerx.isText(element)){var replace=translateSlashMe(jabberwerx.$(element).text(),displayName);if(xep0245Found){jabberwerx.$(element).replaceWith(replace);}else{textNodeFound=true;}}else if(element.hasChildNodes()){for(var i=0;i<element.childNodes.length;i++){findTextNodes(element.childNodes[i],displayName);}}}};var translateSlashMe=function(rawText,displayName){var slashMe="/me ";if(rawText.substring(0,slashMe.length).toLowerCase()==slashMe){xep0245Found=true;return("* "+displayName+" "+rawText.substring(slashMe.length));}
  return rawText;};if(typeof content=="string"){content=translateSlashMe(content,displayName);}else if(jabberwerx.isElement(content)){for(var i=0;i<content.childNodes.length;i++){if(!xep0245Found&&!textNodeFound){findTextNodes(content.childNodes[i],displayName);}else{break;}}}else{throw new jabberwerx.Message.InvalidContentFormat();}
  if(xep0245Found){translatedContent=content;}
  return translatedContent;};jabberwerx.Message.InvalidContentFormat=jabberwerx.util.Error.extend('The content parameter must be of type string or a jQuery object.');jabberwerx.Presence=jabberwerx.Stanza.extend({init:function(packet){if(packet){if(!jabberwerx.isElement(packet)){throw new TypeError("packet must be a &lt;presence/&gt; Element");}
  if(packet.nodeName!="presence"){throw new TypeError("packet must be a &lt;presence/&gt; Element");}}
  this._super(packet||"{jabber:client}presence");},getPriority:function(){var pri=this._getChildText("priority");pri=(pri)?parseInt(pri):0;return!isNaN(pri)?pri:0;},setPriority:function(pri){if(pri!==undefined&&pri!==null&&typeof(pri)!="number"){throw new TypeError("new priority must be a number or undefined");}
  this._setChildText("priority",pri);},getShow:function(){return this._getChildText("show")||jabberwerx.Presence.SHOW_NORMAL;},setShow:function(show){if(show&&(show!=jabberwerx.Presence.SHOW_AWAY&&show!=jabberwerx.Presence.SHOW_CHAT&&show!=jabberwerx.Presence.SHOW_DND&&show!=jabberwerx.Presence.SHOW_XA)){throw new TypeError("show must be undefined or one of 'away', 'chat', 'dnd', or 'xa'");}
  this._setChildText("show",show||undefined);},getStatus:function(){return this._getChildText("status")||null;},setStatus:function(status){this._setChildText("status",status||undefined);},compareTo:function(presence){if(!(presence&&presence instanceof jabberwerx.Presence)){throw new TypeError("presence must be an instanceof jabberwerx.Presence");}
  var p1,p2;p1=this.getPriority()||0;p2=presence.getPriority()||0;if(p1>p2){return 1;}else if(p1<p2){return-1;}
  p1=this.timestamp;p2=presence.timestamp;if(p1>p2){return 1;}else if(p1<p2){return-1;}
  return 0;},setPresence:function(show,status,priority){if(show){this.setShow(show);}
  if(status){this.setStatus(status);}
  if(priority!==undefined&&priority!==null){this.setPriority(priority);}
  return this;}},"jabberwerx.Presence");jabberwerx.Presence.SHOW_AWAY="away";jabberwerx.Presence.SHOW_CHAT="chat";jabberwerx.Presence.SHOW_DND="dnd";jabberwerx.Presence.SHOW_NORMAL="";jabberwerx.Presence.SHOW_XA="xa";})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/User.js*/
;(function(jabberwerx){jabberwerx.User=jabberwerx.Entity.extend({init:function(jid,cache){this._super({jid:jid},cache);}},'jabberwerx.User');jabberwerx.LocalUser=jabberwerx.User.extend({getDisplayName:function(){return this._displayName||jabberwerx.JID.unescapeNode(this.jid.getNode());}},'jabberwerx.LocalUser');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Stream.js*/
;(function(jabberwerx){jabberwerx.Stream=jabberwerx.JWModel.extend({init:function(){this.applyEvent("streamOpened");this.applyEvent("streamClosed");this.applyEvent("streamElementsReceived");this.applyEvent("streamElementsSent");this._recvQ=new jabberwerx.Stream.Queue();this._sendQ=new jabberwerx.Stream.Queue();this._xhrs=new jabberwerx.Stream.Queue();this._xhrSetup={cache:false,xhr:this.invocation("_createXHR",jabberwerx.$.ajaxSettings.xhr),beforeSend:this.invocation("_prepareXHR"),complete:this.invocation("_handleXHR"),contentType:"text/xml",dataType:"text",global:false,processData:false,type:"POST"};},getProperties:function(){return jabberwerx.$.extend(true,{},this._boshProps);},isOpen:function(){return this._opened;},isSecure:function(){return this._boshProps.secure||false;},getDomain:function(){return this._boshProps.domain||null;},getSessionID:function(){return this._boshProps.sid||null;},getTimeout:function(){return this._boshProps.timeout||60;},open:function(params){if(this.isOpen()){throw new jabberwerx.Stream.AlreadyOpenError();}
  this._reset();this._boshProps=jabberwerx.$.extend({},params||{});if(!this._boshProps.domain){throw new TypeError("domain must be specified");}
  if(!this._boshProps.timeout){this._boshProps.timeout=jabberwerx.Stream.DEFAULT_TIMEOUT;}
  if(!this._boshProps.wait){this._boshProps.wait=jabberwerx.Stream.DEFAULT_WAIT;}
  var url=jabberwerx.Stream.URL_PARSER.exec(this._boshProps.httpBindingURL||"");if(!url){throw new TypeError("httpBindingURL not specified correctly");}
  var myProto=jabberwerx.system.getLocation().protocol;if(!url[1]){url[1]=myProto||"";}else if(myProto&&url[1]!=myProto){jabberwerx.util.debug.warn("BOSH URL has different protocol than webserver: "+url[1]+" != "+myProto);}
  if(!url[2]){url[2]=jabberwerx.system.getLocation().host||"";}
  if(!url[3]){url[3]="";}
  this._boshProps.networkAttempts=0;this._storeConnectionInfo(url[1],url[2],url[3]);this._boshProps.operation="open";this._sendRequest();this._boshProps.heartbeat=jabberwerx.system.setInterval(this.invocation("_heartbeat"),jabberwerx.Stream.HEARTBEAT_INTERVAL);},_storeConnectionInfo:function(protocol,hostPort,resource){this._boshProps.httpBindingURL=protocol+"//"+
  hostPort+"/"+
  resource;this._boshProps.secure=this._boshProps.secure||(protocol=="https:");this._boshProps.crossSite=(jabberwerx.system.getLocation().protocol!=protocol)||(jabberwerx.system.getLocation().host!=hostPort);},reopen:function(){if(!this.isOpen()){throw new jabberwerx.Stream.NotOpenError();}
  this._boshProps.opening=jabberwerx.system.setTimeout(this.invocation("_handleOpen"),2000);this._boshProps.operation="reopen";this._sendRequest({restart:true});},close:function(){if(this.isOpen()&&this._boshProps&&!this._boshProps.networkBackoff){delete this._boshProps.resend;delete this._boshProps.networkBackoff;this._boshProps.networkAttempts=0;this._sendRequest({type:"terminate"},this._sendQ.empty());}else{this._reset();}},send:function(elem){if(!jabberwerx.isElement(elem)){throw new TypeError("elem must be a DOM element");}
  if(!this.isOpen()){throw new jabberwerx.Stream.NotOpenError();}
  this._sendQ.enque(elem);},_sendRequest:function(props,data){props=jabberwerx.$.extend({},this._boshProps,props);data=data||[];var rid=0,body;var resend=false;if(props.resend){try{body=jabberwerx.util.unserializeXML(props.resend.body);resend=true;}catch(ex){jabberwerx.util.debug.log("Exception: "+ex.message+" trying to parse resend body: "+props.resend.body);delete props.resend;return;}
  rid=props.resend.id;data=jabberwerx.$(body).children();props.rid=rid+1;delete props.resend;}else{if(this._xhrs.size()>1&&data.length){this._sendQ.enque(data);return;}
  if(!props.rid){var initial;initial=Math.floor(Math.random()*4294967296);initial=(initial<=32768)?initial+32768:initial;props.rid=initial;}else if(this._boshProps.rid>=9007199254740991){var err=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}policy-violation","BOSH maximum rid exceeded");this._handleClose(err.getNode());return;}
  rid=props.rid++;body=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/httpbind}body");if(props.type){body.attribute("type",props.type);}
  locale=jabberwerx.system.getLocale();if(!props.sid){if(data.length){this._sendQ.enque(data);data=[];}
    if(locale){body.attribute("xml:lang",locale);}
    body.attribute("xmlns:xmpp","urn:xmpp:xbosh").attribute("hold","1").attribute("ver","1.9").attribute("to",props.domain).attribute("wait",props.wait||30).attribute("{urn:xmpp:xbosh}xmpp:version","1.0");if(props.jid){body.attribute("from",jabberwerx.JID.asJID(props.jid).getBareJIDString());}}else{body.attribute("sid",props.sid);if(props.restart){if(locale){body.attribute("xml:lang",locale);}
    body.attribute("{urn:xmpp:xbosh}xmpp:restart","true").attribute("to",props.domain);this._boshProps.restart=true;}}
  body.attribute("rid",rid);if(data.length){for(var idx=0;idx<data.length;idx++){body.node(data[idx]);}}
  body=body.data;}
  if(!props.requests){props.requests=new jabberwerx.Stream.Queue();}
  props.requests.enque({id:rid,body:jabberwerx.util.serializeXML(body)});var setup={async:true,data:props.requests.tail().body,timeout:props.wait*1000+5000,url:props.httpBindingURL};setup=jabberwerx.$.extend(setup,this._xhrSetup);if(this._boshProps.crossSite&&!jabberwerx.$.support.cors&&typeof(XDomainRequest)!="undefined"){setup.crossDomain=false;}
  if(this._boshProps){this._boshProps=props;}
  if(!resend&&data.length){this.event("streamElementsSent").trigger(jabberwerx.$(data));}
  var xhr=jabberwerx.$.ajax(setup);},_createXHR:function(xhrFn){xhrFn=jabberwerx.$.ajaxSettings.xhr;var xhr=null;if(this._boshProps.crossSite&&!jabberwerx.$.support.cors&&typeof(XDomainRequest)!=="undefined"){var that=this;var done=this._boshProps.type=="terminate";var xdr=new XDomainRequest();var xhr={readyState:0,abort:function(){xdr.abort();this.readyState=0;},open:function(){xdr.open.apply(xdr,arguments);this.readyState=1;this.onreadystatechange&&this.onreadystatechange.call(this);this.async=arguments[2]||true;},send:function(){this.readyState=2;this.onreadystatechange&&this.onreadystatechange.call(this);xdr.send.apply(xdr,arguments);},setRequestHeader:function(){},getResponseHeader:function(){},getAllResponseHeaders:function(){}};var onreadyCB=function(status){xhr.onreadystatechange&&xhr.onreadystatechange.call(this,status);};xdr.onload=function(){xhr.responseText=xdr.responseText;xhr.status=200;xhr.readyState=4;onreadyCB();};xdr.onprogress=function(){xhr.readyState=3;onreadyCB();};xdr.onerror=function(){xhr.readyState=4;xhr.status=500;onreadyCB("error");};xdr.ontimeout=function(){xhr.readyState=4;xhr.status=408;onreadyCB("timeout");};}else{xhr=xhrFn();}
  return xhr;},_heartbeat:function(){var elems=this._recvQ.empty();if(elems.length){elems=jabberwerx.$(elems);this.event("streamElementsReceived").trigger(elems);}
  if(this._boshProps.networkBackoff){this._boshProps.networkBackoff--;return;}
  if(!this.isOpen()&&!this._boshProps.operation){return;}
  if(!this._sendQ.size()&&this._xhrs.size()&&!this._boshProps.resend){return;}
  this._sendRequest({},this._sendQ.empty());},_prepareXHR:function(xhr,settings){this._xhrs.enque(xhr);},_handleXHR:function(xhr,status){if(this._dehydrated||!this._xhrs||(this._xhrs.size()===0)){return;}
  this._xhrs.deque(xhr);var failFn=function(err,resend){var boshProps=this._boshProps;if(!boshProps){return;}
    if(boshProps.type=="terminate"){this._handleClose();return;}
    if(boshProps.networkAttempts++<3){jabberwerx.util.debug.log("network timeout retry "+
      boshProps.networkAttempts);if(resend){resend=boshProps.requests.pop();}
      if(resend){boshProps.resend=resend;}
      boshProps.networkBackoff=jabberwerx.Stream.NETWORK_BACKOFF_COUNT*Math.pow(boshProps.networkAttempts,2);return;}
    this._handleClose(err&&err.getNode());};if(status!="success"){var err;switch(status){case"timeout":err=jabberwerx.Stream.ERR_REMOTE_SERVER_TIMEOUT;break;case"error":err=jabberwerx.Stream.ERR_SERVICE_UNAVAILABLE;break;case"parseerror":err=jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED;break;default:err=jabberwerx.Stream.ERR_UNDEFINED_CONDITION;break;}
    failFn.call(this,err,true);return;}
  var dom=xhr.responseText;if(!dom){failFn.call(this,jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED);return;}
  try{dom=jabberwerx.util.unserializeXML(dom);}catch(ex){failFn.call(this,jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED);return;}
  if(!dom){failFn.call(this,jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED);return;}
  dom=jabberwerx.$(dom);if(!dom.is("body[xmlns='http://jabber.org/protocol/httpbind']")){failFn.call(this,jabberwerx.Stream.ERR_SERVICE_UNAVAILABLE);return;}
  this._boshProps.networkAttempts=0;if(this._boshProps&&this._boshProps.requests){this._boshProps.requests.deque();}
  var content=dom.children();if(!this._boshProps.sid){var attr;attr=dom.attr("sid");if(attr){this._boshProps.sid=attr;}
    attr=dom.attr("wait");if(attr){this._boshProps.wait=parseInt(attr);}
    attr=dom.attr("inactivity");if(attr){this._boshProps.timeout=parseInt(attr);}}
  if(content.length){var feats=null,err=null;content=content.map(function(){switch(this.nodeName){case"stream:features":feats=this;break;case"stream:error":err=this;break;default:return this;}
    return null;});if(feats){this._handleOpen(feats);}
    if(content.length){this._recvQ.enque(content.get());}
    if(err){this._handleClose(err);return;}}
  var err;switch(dom.attr("type")||this._boshProps.type){case"terminate":if(!this._boshProps.type){switch(dom.attr("condition")||""){case"":err=null;break;case"bad-request":err=jabberwerx.Stream.ERR_BAD_REQUEST;break;case"host-gone":err=jabberwerx.Stream.ERR_SERVICE_UNAVAILABLE;break;case"other-request":err=jabberwerx.Stream.ERR_CONFLICT;break;case"policy-violation":err=jabberwerx.Stream.ERR_POLICY_VIOLATION;break;case"system-shutdown":err=jabberwerx.Stream.ERR_SYSTEM_SHUTDOWN;break;case"see-other-uri":var uri=dom.children("uri").text();if(!uri||uri=="")
  {err=jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED;break;}
    var uriParts=jabberwerx.Stream.URL_PARSER.exec(uri);var protocol=uriParts[1];var hostPort=uriParts[2];var resource=uriParts[3];var origParts=jabberwerx.Stream.URL_PARSER.exec(this._boshProps.httpBindingURL);var origProtocol=origParts[1];var origHostPort=origParts[2];if(origProtocol=="http:"){var tmpOrigHostPort="."+origHostPort;var tmpHostPort="."+hostPort;var diff=tmpHostPort.length-tmpOrigHostPort.length;var validDomain=diff>=0&&tmpHostPort.lastIndexOf(tmpOrigHostPort)===diff;if(!((protocol==origProtocol)&&(validDomain))){err=jabberwerx.Stream.ERR_POLICY_VIOLATION;break;}}else if(origProtocol=="https:"){if((!protocol||protocol=="")||(!hostPort||hostPort=="")){err=jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED;break;}}else{err=jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED;break;}
    this._storeConnectionInfo(protocol,hostPort,resource);return;default:err=jabberwerx.Stream.ERR_UNDEFINED_CONDITION;break;}}
    this._handleClose(err&&err.getNode());return;case"error":break;}},_handleOpen:function(feats){if(this._boshProps.opening){jabberwerx.system.clearTimeout(this._boshProps.opening);delete this._boshProps.opening;}
  delete this._boshProps.restart;delete this._boshProps.operation;if(!jabberwerx.isElement(feats)){feats=new jabberwerx.NodeBuilder("{http://etherx.jabber.org/streams}stream:features");feats.element("{urn:ietf:params:xml:ns:xmpp-bind}bind");feats.element("{urn:ietf:params:xml:ns:xmpp-session}session");feats=feats.data;}
  var that=this;jabberwerx.system.setTimeout(function(){that._opened=true;that.event("streamOpened").trigger(feats);},1);},_handleClose:function(err){var open=this.isOpen();var oper=this._boshProps.operation;this._reset();if(open||oper){var that=this;jabberwerx.system.setTimeout(function(){that.event("streamClosed").trigger(err);},10);}},_reset:function(){jabberwerx.system.clearInterval(this._boshProps.heartbeat);this._opened=false;this._boshProps={};this._sendQ.empty();this._xhrs.empty();this._recvQ.empty();},willBeSerialized:function(){this._dehydrated=true;if(this.isOpen()){jabberwerx.system.clearInterval(this._boshProps.heartbeat);}
  if(this._boshProps){if(this._boshProps.networkAttempts){this._boshProps.networkAttempts--;}
    this._boshProps.networkBackoff=jabberwerx.Stream.NETWORK_BACKOFF_COUNT;}
  var elems;elems=this._sendQ.empty();elems=jabberwerx.$.map(elems,function(){return jabberwerx.util.serializeXML(this);});this._sendQ.enque(elems);elems=this._recvQ.empty();elems=jabberwerx.$.map(elems,function(){return jabberwerx.util.serializeXML(this);});this._recvQ.empty();delete this._xhrs;},wasUnserialized:function(){this._xhrs=new jabberwerx.Stream.Queue();var elems;elems=this._sendQ.empty();elems=jabberwerx.$.map(elems,function(){return jabberwerx.util.unserializeXML(String(this));});this._sendQ.enque(elems);delete this._dehydrated;if(this.isOpen()){this._boshProps.resend=this._boshProps.requests.deque();this._boshProps.heartbeat=jabberwerx.system.setInterval(this.invocation("_heartbeat"),jabberwerx.Stream.HEARTBEAT_INTERVAL);}},_opened:false,_boshProps:{},_xhrSetup:{},_xhrs:null,_sendQ:null,_recvQ:null},"jabberwerx.Stream");jabberwerx.Stream.Queue=jabberwerx.JWModel.extend({init:function(){this._super();},head:function(){return this._q||null;},tail:function(){return this._q[this._q.length-1]||null;},enque:function(item){for(var idx=0;idx<arguments.length;idx++){item=arguments[idx];var tmp=[this._q.length,0].concat(item);this._q.splice.apply(this._q,tmp);}
  return this.size();},deque:function(item){if(item!==undefined){var idx=jabberwerx.$.inArray(item,this._q);if(idx!=-1){this._q.splice(idx,1);}else{item=null;}}else{item=this._q.shift()||null;}
  return item;},pop:function(){return this._q.pop()||null;},find:function(cmp){if(!jabberwerx.$.isFunction(cmp)){throw new TypeError("comparator must be a function");}
  var result=null;jabberwerx.$.each(this._q,function(){result=cmp(this);return(result!==undefined);});return result;},empty:function(){var q=this._q;this._q=[];return q;},size:function(){return this._q.length;},_q:[]},"jabberwerx.Stream.Queue");jabberwerx.Stream.URL_PARSER=/^(?:([0-9a-zA-Z]+\:)\/\/)?(?:([^\/]+))?(?:\/(.*))?$/;jabberwerx.Stream.DEFAULT_TIMEOUT=300;jabberwerx.Stream.DEFAULT_WAIT=30;jabberwerx.Stream.HEARTBEAT_INTERVAL=10;jabberwerx.Stream.NETWORK_BACKOFF_COUNT=50;jabberwerx.Stream.NotOpenError=jabberwerx.util.Error.extend("Stream not open");jabberwerx.Stream.AlreadyOpenError=jabberwerx.util.Error.extend("Stream is already open");jabberwerx.Stream.ErrorInfo=jabberwerx.JWModel.extend({init:function(cond,text){this._super();this.condition=cond||"{urn:ietf:params:xml:ns:xmpp-streams}undefined-condition";this.text=text||"";this.toString=this._toErrString;},getNode:function(){var builder=new jabberwerx.NodeBuilder("{http://etherx.jabber.org/streams}stream:error");builder.element(this.condition);if(this.text){builder.element("{urn:ietf:params:xml:ns:xmpp-streams}text").text(this.text);}
  return builder.data;},wasUnserialized:function(){this.toString=this._toErrString;},_toErrString:function(){return this.condition;},condition:"",text:""},"jabberwerx.Stream.ErrorInfo");jabberwerx.Stream.ErrorInfo.createWithNode=function(node){if(!jabberwerx.isElement(node)){throw new TypeError("node must be an Element");}
  node=jabberwerx.$(node);var cond=node.children("[xmlns='urn:ietf:params:xml:ns:xmpp-streams']:not(text)").map(function(){return"{urn:ietf:params:xml:ns:xmpp-streams}"+this.nodeName;}).get(0);var text=node.children("text[xmlns='urn:ietf:params:xml:ns:xmpp-streams']").text();return new jabberwerx.Stream.ErrorInfo(cond,text);};jabberwerx.Stream.ERR_BAD_REQUEST=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}bad-request");jabberwerx.Stream.ERR_CONFLICT=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}conflict");jabberwerx.Stream.ERR_POLICY_VIOLATION=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}policy-violation");jabberwerx.Stream.ERR_REMOTE_CONNECTION_FAILED=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}remote-connection-failed");jabberwerx.Stream.ERR_REMOTE_SERVER_TIMEOUT=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}remote-server-timeout");jabberwerx.Stream.ERR_SERVICE_UNAVAILABLE=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}service-unavailable");jabberwerx.Stream.ERR_SYSTEM_SHUTDOWN=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}system-shutdown");jabberwerx.Stream.ERR_UNDEFINED_CONDITION=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}undefined-condition");jabberwerx.Stream.ERR_XML_NOT_WELL_FORMED=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}xml-not-well-formed");jabberwerx.Stream.ERR_POLICY_VIOLATION=new jabberwerx.Stream.ErrorInfo("{urn:ietf:params:xml:ns:xmpp-streams}policy-violation");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Client.js*/
;(function(jabberwerx){jabberwerx.ClientEntityCache=jabberwerx.EntitySet.extend({init:function(){this._super();},register:function(entity){if(!(entity&&entity instanceof jabberwerx.Entity)){throw new TypeError("entity is not an Entity");}
  var prev=this.entity(entity.jid,entity.node);if(prev&&prev!==entity){throw new jabberwerx.EntitySet.EntityAlreadyExistsError();}else if(!prev){this.event("entityCreated").trigger(entity);}
  return this._super(entity);},unregister:function(entity){var result=this._super(entity);if(result){this.event("entityDestroyed").trigger(entity);}
  return result;},localUser:function(jid){var ent=this.entity(jid);if(!(ent&&ent instanceof jabberwerx.LocalUser)){ent=new jabberwerx.LocalUser(jid,this);this.register(ent);}
  return ent;},server:function(serverDomain){var ent=this.entity(serverDomain);if(!ent||!(ent instanceof jabberwerx.Server)){ent=new jabberwerx.Server(serverDomain,this);this.register(ent);}
  return ent;},temporaryEntity:function(jid){var ent=this.entity(jid);if(!(ent&&ent instanceof jabberwerx.TemporaryEntity)){ent=new jabberwerx.TemporaryEntity(jid,this);this.register(ent);}
  return ent;}},"jabberwerx.ClientEntityCache");jabberwerx.Client=jabberwerx.JWModel.extend({init:function(resourceName){this._super();this.applyEvent('clientStatusChanged');this.applyEvent('beforeIqSent');this.applyEvent('iqSent');this.applyEvent('beforeIqReceived');this.applyEvent('iqReceived');this.applyEvent('afterIqReceived');this.applyEvent('beforeMessageSent');this.applyEvent('messageSent');this.applyEvent('beforeMessageReceived');this.applyEvent('messageReceived');this.applyEvent('afterMessageReceived');this.applyEvent('beforePresenceSent');this.applyEvent('presenceSent');this.applyEvent('beforePresenceReceived');this.applyEvent('presenceReceived');this.applyEvent('afterPresenceReceived');this.applyEvent('reconnectCountdownStarted');this.applyEvent('reconnectCancelled');this.applyEvent('clientConnected');this.applyEvent('clientDisconnected');this.entitySet=new jabberwerx.ClientEntityCache();if(resourceName&&typeof resourceName=='string'){this.resourceName=resourceName;}
else{this._autoResourceName=true;}
  this._stream=new jabberwerx.Stream();this.event('afterIqReceived').bindWhen('iq[type="get"] *[xmlns="urn:xmpp:time"]',this.invocation('_handleEntityTime'));this.event('afterIqReceived').bindWhen('iq[type="get"] *[xmlns="jabber:iq:time"]',this.invocation('_handleIqTime'));this.event('presenceReceived').bind(this.invocation('_handlePresenceIn'));},destroy:function(){jabberwerx.$.each(this.controllers,function(){this.destroy();});this._super();},_setStreamHandler:function(evt,funcName){this._clearStreamHandler(evt);this._streamHandlers[evt]=funcName;this._stream.event(evt).bind(this.invocation(this._streamHandlers[evt]));},_clearStreamHandler:function(evt){if(this._streamHandlers[evt]!==undefined){this._stream.event(evt).unbind(this.invocation(this._streamHandlers[evt]));delete this._streamHandlers[evt];}},_clearStreamHandlers:function(){this._clearStreamHandler('streamOpened');this._clearStreamHandler('streamClosed');this._clearStreamHandler('streamElementsReceived');this._clearStreamHandler('streamElementsSent');this._streamHandlers={};},_newConnectParams:function(cjid,password,arg){cjid=jabberwerx.JID.asJID(cjid);return{jid:cjid,password:password,username:cjid.getNode(),domain:cjid.getDomain(),resource:this.resourceName,httpBindingURL:arg.httpBindingURL||jabberwerx._config.httpBindingURL,secure:arg.unsecureAllowed||jabberwerx._config.unsecureAllowed||false,timeout:arg.timeout||null,wait:arg.wait||null,arg:arg};},connect:function(jid,password,arg){var __createEntities=function(client){var user;jabberwerx.$.each(client.entitySet.toArray(),function(){if(this instanceof jabberwerx.LocalUser){if(client._connectParams.jid.equals(this.jid)){user=this;}else{this.remove();}}});client.connectedUser=user||client.entitySet.localUser(client._connectParams.jid);client._setFullJid();var server;jabberwerx.$.each(client.entitySet.toArray(),function(){if(this instanceof jabberwerx.Server){if(client._connectParams.jid.getDomain()==this.jid.getDomain()){server=this;}else{this.remove();}}});client.connectedServer=server||client.entitySet.server(client._connectParams.jid.getDomain());}
  var __bindCallbacks=function(client){var successCB=client._connectParams.arg.successCallback;var errorCB=client._connectParams.arg.errorCallback;if(successCB||errorCB){var fn=function(evt){var evtCon=(evt.data.next==jabberwerx.Client.status_connected);var evtDiscon=(evt.data.next==jabberwerx.Client.status_disconnected);if(evtCon||evtDiscon){client.event('clientStatusChanged').unbind(fn);if(successCB&&evtCon){successCB(client);}else if(errorCB&&evt.data.error&&evtDiscon){errorCB(evt.data.error);}}};client.event('clientStatusChanged').bind(fn);}}
  if(this.clientStatus!=jabberwerx.Client.status_disconnected){jabberwerx.util.debug.log("client not disconnected!");return;}
  if(!arg){arg={};}
  this.cancelReconnect();this._clearStreamHandlers();this._stream.close();try{var cjid=jabberwerx.JID.asJID(jid);if(!cjid.getNode()){arg.register=true;cjid=new jabberwerx.JID({domain:cjid.getDomain(),node:"CAXL_"+jabberwerx.util.crypto.generateUUID()});if(!password){password=jabberwerx.util.crypto.b64_sha1(jabberwerx.util.crypto.generateUUID());}}
    this._connectParams=this._newConnectParams(cjid,password,arg);this._openStream();__createEntities(this);__bindCallbacks(this);if(this._connectParams.arg.reconnecting){this.setClientStatus(jabberwerx.Client.status_reconnecting);this._connectParams.arg.reconnecting=false;}else{this.setClientStatus(jabberwerx.Client.status_connecting);}
    this._connectionAttempts++;}catch(ex){this._connectParams={};throw new jabberwerx.Client.ConnectionError(ex.message||'invalid connection information');}},_filterStreamOpts:function(cparams){cparams=cparams||{};return{jid:cparams.jid,domain:cparams.domain,timeout:cparams.timeout,wait:cparams.wait,secure:cparams.secure,httpBindingURL:cparams.httpBindingURL};},_openStream:function(){if(this._connectParams.arg.register){this._setStreamHandler('streamOpened','_handleRegistrationOpened');}else{this._setStreamHandler('streamOpened','_handleAuthOpened');}
  this._setStreamHandler('streamClosed','_handleClosed');var streamOpts=this._filterStreamOpts(this._connectParams);try{this._stream.open(streamOpts);}catch(ex){this._clearStreamHandlers();throw ex;}},_handleRegistrationOpened:function(){try{this._clearStreamHandler('streamOpened');var registerIQ=new jabberwerx.IQ();registerIQ.setType("set");registerIQ.setID(jabberwerx.Stanza.generateID());var builder=new jabberwerx.NodeBuilder('{jabber:iq:register}query');builder=builder.element("username").text(this._connectParams.username).parent;builder=builder.element("password").text(this._connectParams.password).parent;registerIQ.setQuery(builder.data);this._setStreamHandler('streamElementsReceived','_handleRegisterElements');this._stream.send(registerIQ.getNode());}catch(ex){this._handleConnectionException(ex);}},_handleRegisterElements:function(elem){try{this._clearStreamHandler('streamElementsReceived');var errNode=jabberwerx.$(elem.data).find("error");if(errNode&&errNode.length!=0){this._connectParams.arg.register=false;this._handleConnectionException(errNode);}
else{this._stream.close();}}catch(ex){this._handleConnectionException(ex);}},_handleAuthOpened:function(feats){try{this._clearStreamHandler('streamOpened');this._connectParams.feats=jabberwerx.$(feats.data);var supportedMechs=[]
  jabberwerx.$(feats.data).find("mechanisms[xmlns='urn:ietf:params:xml:ns:xmpp-sasl']>mechanism").each(function(){supportedMechs.push(jabberwerx.$(this).text().toUpperCase());});this._authMech=jabberwerx.sasl.createMechanismFor(this,supportedMechs);if(!this._authMech){throw new jabberwerx.Client.ConnectionError("{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak");}
  this._setStreamHandler('streamElementsReceived','_handleAuthElements');this._handleAuthElements();}catch(ex){this._handleConnectionException(ex);}},_handleAuthElements:function(elem){try{elem=elem&&jabberwerx.$(elem.data).get(0);elem=this._authMech.evaluate(elem);if(elem){this._stream.send(elem);}else{var authComplete=this._authMech.complete;this._authMech=undefined;delete this._authMech;if(!authComplete){throw new jabberwerx.SASLMechanism.SASLAuthFailure();}else{this._setStreamHandler('streamOpened','_handleBindOpened');this._stream.reopen();}}}catch(ex){this._handleConnectionException(ex);}
  return true;},_handleBindOpened:function(feats){try{this._clearStreamHandler('streamOpened');this._connectParams.bindJID=null;feats=jabberwerx.$(feats.data);this._connectParams.feats=feats;if(feats.find("bind[xmlns='urn:ietf:params:xml:ns:xmpp-bind']").length>0){var bindIQ=new jabberwerx.IQ();bindIQ.setType("set");bindIQ.setID(jabberwerx.Stanza.generateID());var builder=new jabberwerx.NodeBuilder('{urn:ietf:params:xml:ns:xmpp-bind}bind');if(this.resourceName){builder=builder.element("resource").text(this._connectParams.resource).parent;}
  bindIQ.setQuery(builder.data);this._setStreamHandler("streamElementsReceived","_handleBindElements");this._stream.send(bindIQ.getNode());}else{this._handleConnected();}}catch(ex){this._handleConnectionException(ex);}},_handleBindElements:function(elements){try{var ele=jabberwerx.$(elements.data);var newjid=ele.find("bind>jid");if(newjid.length>0){this._connectParams.bindJID=jabberwerx.$(newjid).text();var jid=jabberwerx.JID.asJID(this._connectParams.bindJID);this.resourceName=jid.getResource();this._handleConnected();}else{this._handleConnectionException(ele.children("error").get(0));}}catch(ex){this._handleConnectionException(ex);}},_handleClosed:function(err){var msg='closed: '+(err&&err.data?jabberwerx.util.serializeXML(err.data):'no error');jabberwerx.util.debug.log(msg);if(this._connectParams.arg.register){this._connectParams.arg.register=false;jabberwerx.system.setTimeout(this.invocation("_openStream"),500);}else{this._disconnected(err.data);}},_handleConnectionException:function(ex){this._clearStreamHandlers();try{this._stream.close();}catch(e){};var n=this._exceptionToErrorNode(ex);jabberwerx.util.debug.log("Exception during connection: "+jabberwerx.util.serializeXML(n));this._disconnected(n);},_exceptionToErrorNode:function(ex){if(jabberwerx.isElement(ex)){return ex;}
  var err=new jabberwerx.NodeBuilder("error");if(ex instanceof jabberwerx.SASLMechanism.SASLAuthFailure){err.element(ex.message);}else if(ex instanceof TypeError){err.element("{urn:ietf:params:xml:ns:xmpp-stanzas}bad-request");if(ex.message){err.element("text").text(ex.message);}}else{var errNode=jabberwerx.$(ex).find("conflict");if(errNode&&errNode.length!=0){var ns=jabberwerx.$(errNode).attr("xmlns");err.element("{"+ns+"}conflict");}else{var emsg=(ex&&ex.message)?ex.message:"{urn:ietf:params:xml:ns:xmpp-stanzas}internal-server-error";try{err.element(emsg);}catch(e){err.element("{urn:ietf:params:xml:ns:xmpp-stanzas}internal-server-error");err.element("text").text(emsg);}}}
  return err.data;},disconnect:function(){if(this.isConnected()){if(this._autoResourceName){this.resourceName=null;}
  this.setClientStatus(jabberwerx.Client.status_disconnecting);this._stream.close();this._connectionAttempts=0;}},isConnected:function(){if(this._connectedRendezvous){return true;}
  return(this.clientStatus==jabberwerx.Client.status_connected&&this._stream.isOpen());},setClientStatus:function(status,error,cb){var prev=this.clientStatus;this.clientStatus=status;if(prev&&(prev!=status)){var data={previous:prev,next:status,error:error};this.event('clientStatusChanged').trigger(data,null,cb);}else if(cb!=null){cb();}
  jabberwerx.util.debug.log('client status: '+this.getClientStatusString(status),'clientStatus');},getClientStatusString:function(status){switch(status){case jabberwerx.Client.status_connected:return jabberwerx._("Connected to {0} as {1}.",(this.connectedServer?this.connectedServer.jid:jabberwerx._("(unknown)")),(this.connectedUser?this.connectedUser.jid:jabberwerx._("(unknown)")));case jabberwerx.Client.status_connecting:return jabberwerx._("Attempting to connect");case jabberwerx.Client.status_error:return jabberwerx._("Connection error");case jabberwerx.Client.status_disconnecting:return jabberwerx._("Disconnecting");case jabberwerx.Client.status_reconnecting:return jabberwerx._("Reconnecting");default:return jabberwerx._("Disconnected");}},getCurrentPresence:function(primary){var me=this.connectedUser;return(me&&(primary?me.getPrimaryPresence():me.getResourcePresence(this.resourceName)))||null;},sendStanza:function(rootName,type,to,content){var s;if(rootName instanceof jabberwerx.Stanza){s=rootName.clone();}else if(jabberwerx.isElement(rootName)){s=jabberwerx.Stanza.createWithNode(rootName);}else{s=new jabberwerx.Stanza(rootName);if(to){s.setTo(to.toString());}
  if(type){s.setType(type.toString());}
  if(content){if(typeof content=='string'){try{content=jabberwerx.util.unserializeXML(content);}catch(ex){jabberwerx.util.debug.log("sendStanza could not parse: '"+content+"'");throw ex;}}
    new jabberwerx.NodeBuilder(s.getNode()).node(content);}
  s=jabberwerx.Stanza.createWithNode(s.getNode());}
  type=s.pType();this.event('before'+type+'Sent').trigger(s);this._stream.send(s.getNode());if(s instanceof jabberwerx.Presence){var presence=s;type=presence.getType();if((!type||(type=="unavailable"))&&!presence.getTo()){presence=presence.clone();presence.setFrom(this.fullJid.toString());this.connectedUser.updatePresence(presence);}}},sendMessage:function(to,body,subject,type,thread){this._assertConnected();var m=new jabberwerx.Message();if(to instanceof jabberwerx.Entity){to=to.jid;}else{to=jabberwerx.JID.asJID(to);}
  m.setTo(to);m.setBody(body);if(subject){m.setSubject(subject);}
  if(thread){m.setThread(thread);}
  if(type){m.setType(type);}
  if(type===undefined||type=='chat'){new jabberwerx.NodeBuilder(m.getNode()).element('{http://jabber.org/protocol/xhtml-im}html').element('{http://www.w3.org/1999/xhtml}body').text(body);}
  this.sendStanza(m);},sendIQ:function(type,to,content,callback,timeout){return this.sendIq.apply(this,arguments);},sendIq:function(type,to,content,callback,timeout){if(callback!==undefined&&!jabberwerx.$.isFunction(callback)){throw new TypeError("callback must be a function");}
  if(timeout!==undefined&&typeof(timeout)!="number"&&!(timeout instanceof Number)){throw new TypeError("timeout must be a number");}
  var i=new jabberwerx.IQ();if(type){i.setType(type);}
  if(to){i.setTo(to);}
  var id=jabberwerx.Stanza.generateID();i.setID(id);if(content){if(typeof(content)=='string'){try{content=jabberwerx.util.unserializeXML(content);}catch(ex){jabberwerx.util.debug.log("sendIQ could not parse: '"+content+"'");throw ex;}}
    new jabberwerx.NodeBuilder(i.getNode()).node(content);}
  if(callback){var that=this;var tid=undefined;var fn=function(evt){var elem=evt.data;if(jabberwerx.isDocument(elem)){elem=elem.documentElement;}else if(elem instanceof jabberwerx.Stanza){elem=elem.getNode();}
    elem=jabberwerx.$(elem);if(elem.attr("type")!="result"&&elem.attr("type")!="error"){return;}
    if(elem.attr("id")!=id){return;}
    var iqto=to;if(!iqto){iqto=(jabberwerx.JID.asJID(elem.attr("from")).getResource()==="")?that.fullJid.getBareJIDString():that.fullJid.toString();}
    if(elem.attr("from")!=iqto){return;}
    try{callback(elem.get()[0]);}catch(ex){jabberwerx.util.debug.log("sendIq callback threw exception: "+ex);}
    evt.notifier.unbind(arguments.callee);if(tid){jabberwerx.system.clearTimeout(tid);tid=undefined;}
    return true;};timeout=Number(timeout||0);if(timeout>0){var tfn=function(){if(tid){that.event('beforeIqReceived').unbind(fn);var iq=i.errorReply(jabberwerx.Stanza.ERR_REMOTE_SERVER_TIMEOUT);iq.setFrom(to);callback(iq.getNode());}}
    tid=jabberwerx.system.setTimeout(tfn,timeout*1000);}
    var idSel='[id="'+id+'"]';this.event('beforeIqReceived').bind(fn);}
  this.sendStanza(i);return id;},sendPresence:function(show,status,to){var p=new jabberwerx.Presence();if(typeof show=='string'){p.setShow(show);}
  if(typeof status=='string'){p.setStatus(status);}
  if(to!==undefined){p.setTo(to);}
  this.sendStanza(p);},selectNodes:function(stanzaDoc,selector){var filteredDoc=stanzaDoc;jabberwerx.util.debug.log('running jquery with selector: '+selector+" on doc:\n\n"+filteredDoc.xml,'stanzaSelectors');var result=jabberwerx.$(selector,filteredDoc);var nodes=[];result.each(function(){nodes.push(this);});if(nodes.length==1){return nodes[0];}
  if(nodes.length==0){return null;}
  return nodes;},getAllPresenceForEntity:function(jid){var retVal=[];jid=jabberwerx.JID.asJID(jid);var entity=this.entitySet.entity(jid.getBareJIDString());if(entity){if(!jid.getResource()){retVal=entity.getAllPresence();}else{retVal=[entity.getResourcePresence(jid.getResource())];}}
  return retVal;},getPrimaryPresenceForEntity:function(jid){jid=jabberwerx.JID.asJID(jid);var entity=this.entitySet.entity(jid.getBareJIDString());if(entity){if(jid.getResource()){return entity.getResourcePresence(jid.getResource());}else{return entity.getPrimaryPresence();}}
  return null;},_handlePresenceIn:function(eventObj){var entity;var presence=eventObj.data;var type=presence.getType();if(!type||type=='unavailable'){var bareJidStr=presence.getFromJID().getBareJIDString();if(bareJidStr){if(presence.getType()=='unavailable'){entity=this.entitySet.entity(bareJidStr);if(entity){entity.updatePresence(presence);}}else{entity=this._findOrCreateEntity(bareJidStr);entity.updatePresence(presence);}}}},_findOrCreateEntity:function(jid){var entity=this.entitySet.entity(jid);if(!entity){entity=this.entitySet.temporaryEntity(jid);}
  return entity;},_cleanupEntityCache:function(){this.entitySet.startBatch();var that=this;this.entitySet.each(function(entity){if(entity.controller&&entity.controller.cleanupEntity)
{entity.controller.cleanupEntity(entity);}
else if((entity.controller===that.entitySet)||(entity instanceof jabberwerx.TemporaryEntity))
{entity.destroy();}});this.entitySet.endBatch();},willBeSerialized:function(){if(this._connectParams&&this._connectParams.password){if(jabberwerx._config.baseReconnectCountdown==0){this._connectParams.password="";}else{this._connectParams.password=jabberwerx.util.encodeSerialization(this._connectParams.password);}}
  this._stopReceiveQueue(false);this._stanzaRecvQ=jabberwerx.$.map(this._stanzaRecvQ,function(){return this.xml;});},wasUnserialized:function(){if(this._connectParams&&this._connectParams.password){this._connectParams.password=jabberwerx.util.decodeSerialization(this._connectParams.password);}},graphUnserialized:function(){if(this._stanzaRecvQ.length){this._stanzaRecvQ=jabberwerx.$.map(this._stanzaRecvQ,function(){return jabberwerx.util.unserializeXML(this);});this._startReceiveQueue(true);}},_assertConnected:function(){if(!this.isConnected()){throw new jabberwerx.Client.NotConnectedError();}},_handleConnected:function(){if(jabberwerx._config.baseReconnectCountdown==0){this._connectParams.password="";}
  this._clearStreamHandler("streamOpened");this._setStreamHandler("streamElementsReceived","_handleElementsReceived");this._setStreamHandler("streamElementsSent","_handleElementsSent");if(this._connectParams.bindJID){var jid=jabberwerx.JID.asJID(this._connectParams.bindJID);if(!jid.getBareJID().equals(this.connectedUser.jid)){this.entitySet._renameEntity(this.connectedUser,jid.getBareJID());if(this.connectedServer.jid.getDomain()!=jid.getDomain()){this.entitySet._renameEntity(this.connectedServer,jid.getDomain());}}
    this.resourceName=jid.getResource();this._setFullJid();}
  this._connectParams.bindJID=null;this.entitySet.startBatch();var rnz=new jabberwerx.Rendezvous(this.invocation("_completeConnected"));this._connectedRendezvous=rnz;var that=this;var delayed=jabberwerx.reduce(this.controllers,function(ctrl,value){return rnz.start(ctrl)||value;});if(!delayed){this._completeConnected();}},_connected:function(){this.event('clientConnected').trigger();},_disconnected:function(err){if(jabberwerx._config.baseReconnectCountdown==0){this._connectParams.password="";delete this._connectParams.password;}
  if((this.clientStatus!=jabberwerx.Client.status_disconnecting)&&(this.clientStatus!=jabberwerx.Client.status_connecting)&&this._shouldReconnect(err))
  {this._startReconnectCountdown();}
  this._clearStreamHandlers();if(this.connectedUser){this.connectedUser.updatePresence();}
  this.connectedUser=null;this._setFullJid();this.connectedServer=null;this._authMech=undefined;delete this._authMech;this._cleanupEntityCache();if(this._autoResourceName&&(this._countDownOn==0)){this.resourceName=null;}
  delete this._connectedRendezvous;this._stopReceiveQueue(true);this.setClientStatus(jabberwerx.Client.status_disconnected,err);this.event('clientDisconnected').trigger(err);},_handleElementsReceived:function(evt){var elements=jabberwerx.$(evt.data).get();this._stanzaRecvQ=this._stanzaRecvQ.concat(elements);this._startReceiveQueue(false);},_handleElementsSent:function(evt){var elements=jabberwerx.$(evt.data);for(var i=0;i<elements.length;++i){this._handleElementOut(elements.get(i));}},cancelReconnect:function(){if(this._reconnectTimerID!==null){jabberwerx.system.clearTimeout(this._reconnectTimerID);this._reconnectTimerID=null;this._countDownOn=0;this.event('reconnectCancelled').trigger();}},isSecure:function(){return this._stream.isSecure();},_shouldReconnect:function(err){return jabberwerx.$("system-shutdown, conflict",err).length===0;},_startReconnectCountdown:function(){var base=Number(jabberwerx._config.baseReconnectCountdown);if(base>0){var reconnectCountdown=base+Math.round((Math.random()-0.5)*(base/5));this._reconnectTimerID=jabberwerx.system.setTimeout(this.invocation('_reconnectTimeoutHandler'),reconnectCountdown*1000);this._countDownOn=reconnectCountdown;this.event('reconnectCountdownStarted').trigger(reconnectCountdown);}},_reconnectTimeoutHandler:function(){this._countDownOn=0;this._reconnectTimerID=null;this._connectParams.arg.reconnecting=true;try{this.connect(this._connectParams.jid,this._connectParams.password,this._connectParams.arg);}catch(ex){jabberwerx.util.debug.log("Failed to reconnect: "+ex.message);}},_handleElementOut:function(stanza){stanza=jabberwerx.Stanza.createWithNode(stanza);var stanzaType=stanza.pType();this.event(stanzaType+"Sent").trigger(stanza);},_startReceiveQueue:function(){if(this._stanzaRecvWorker||!this._stanzaRecvQ.length){return;}
  this._stanzaRecvWorker=jabberwerx.system.setTimeout(this.invocation("_processReceiveQueue"),jabberwerx.Client.STANZA_PROCESS_INTERVAL);},_stopReceiveQueue:function(clear){if(this._stanzaRecvWorker){jabberwerx.system.clearTimeout(this._stanzaRecvWorker);delete this._stanzaRecvWorker;}
  if(clear){this._stanzaRecvQ=[];}},_processReceiveQueue:function(){var idx=0;delete this._stanzaRecvWorker;for(idx=0;idx<jabberwerx.Client.STANZA_PROCESS_COUNT;idx++){var processStanza=function(stanza,stanzaType,notifiers,that,handled){var handleStanza=function(results){handled=handled||Boolean(results);if(!handled){if(notifiers.length){notifiers.shift().trigger(stanza,undefined,handleStanza);}else{if(!results&&stanzaType=='iq'&&(stanza.getType()=='get'||stanza.getType()=='set')){stanza=stanza.errorReply(jabberwerx.Stanza.ERR_FEATURE_NOT_IMPLEMENTED);that.sendStanza(stanza);}}}};handleStanza(false);}
  var stanza=this._stanzaRecvQ.shift();if(!stanza){return;}
  stanza=jabberwerx.Stanza.createWithNode(stanza);var stanzaType=stanza.pType();var notifiers=[this.event('before'+stanzaType+'Received'),this.event(stanzaType+'Received'),this.event('after'+stanzaType+'Received')];var that=this;var handled=false;processStanza(stanza,stanzaType,notifiers,that,handled);}
  this._startReceiveQueue(true);},_handleIqTime:function(evt){var now=new Date();var tz;tz=now.toString();tz=tz.substring(tz.lastIndexOf(' ')+1);var iq=evt.data;iq=iq.reply();var query=new jabberwerx.NodeBuilder(iq.getQuery());query.element('display').text(now.toLocaleString());query.element('utc').text(jabberwerx.generateTimestamp(now,true));query.element('tz').text(tz);this.sendStanza(iq);return true;},_handleEntityTime:function(evt){var now=new Date();var tzo;var h,m;tzo=now.getTimezoneOffset();h=tzo/60;m=tzo%60;tzo=(tzo>0?'-':'+')+
  (h<10?'0'+h:h)+':'+
  (m<10?'0'+m:m);var iq=evt.data;iq=iq.reply();var query=new jabberwerx.NodeBuilder(iq.getQuery());query.element('tzo').text(tzo);query.element('utc').text(jabberwerx.generateTimestamp(now,false));this.sendStanza(iq);return true;},_generateUsername:function(){return hex_md5(this._guid+((this._connectionAttempts)+(new Date().valueOf)));},_generatePassword:function(username){return hex_md5(username+Math.floor(Math.random()*3000)+2);},_completeConnected:function(rnz){delete this._connectedRendezvous;this.entitySet.endBatch();this.setClientStatus(jabberwerx.Client.status_connected,null,this.invocation("_connected"));},_setFullJid:function(){this.fullJid=this.connectedUser?jabberwerx.JID.asJID(this.connectedUser.jid+(this.resourceName?"/"+this.resourceName:"")):null;},controllers:{},resourceName:null,connectedUser:null,fullJid:null,_stream:null,_streamHandlers:[],clientStatus:3,connectedServer:null,entitySet:null,autoRegister:false,_stanzaRecvQ:[],_connectionAttempts:0,_reconnectTimerID:null,_connectParams:{},_autoResourceName:false,_countDownOn:0},'jabberwerx.Client');try{Object.defineProperty(jabberwerx.Client.prototype,"fullJid",{get:function(){return this.connectedUser?jabberwerx.JID.asJID(this.connectedUser.jid+(this.resourceName?"/"+this.resourceName:"")):null;},enumerable:true,writeable:false,configurable:false});jabberwerx.Client._setFullJid=function(){};}catch(ex){}
  jabberwerx.Client.status_connecting=1;jabberwerx.Client.status_connected=2;jabberwerx.Client.status_disconnected=3;jabberwerx.Client.status_disconnecting=4;jabberwerx.Client.status_reconnecting=5;jabberwerx.Client.NotConnectedError=jabberwerx.util.Error.extend('The client is not connected.');jabberwerx.Client.ConnectionError=jabberwerx.util.Error.extend();jabberwerx.Client.DisconnectError=jabberwerx.util.Error.extend();jabberwerx.Client.STANZA_PROCESS_INTERVAL=1;jabberwerx.Client.STANZA_PROCESS_COUNT=5;})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/MUCRoom.js*/
;(function(jabberwerx){jabberwerx.MUCOccupant=jabberwerx.Entity.extend({init:function(room,nick){if(!(room&&room instanceof jabberwerx.MUCRoom)){throw new TypeError("room must be a non-null instance of jabberwerx.MUCRoom");}
  if(!nick){throw new TypeError("nick must be a non-empty string");}
  var jid=new jabberwerx.JID({node:room.jid.getNode(),domain:room.jid.getDomain(),resource:nick});this._super({jid:jid},room.occupants);this.room=room;room.occupants.register(this);},getNickname:function(){return this.jid.getResource();},getDisplayName:function(){return this.getNickname();},setDisplayName:function(name){},updatePresence:function(presence){if(!(presence&&presence instanceof jabberwerx.Presence)){throw new TypeError("must provide a valid non-subscription Presence");}
  if(presence.getFrom()!=this.jid){throw new TypeError("presence not appropriate to this occupant");}
  var type=presence.getType()||"";if(type&&type!="unavailable"){throw new TypeError("must provide a valid non-subscription Presence");}
  if(type=="unavailable"){this._presenceList.splice(0,1);}else if(this._presenceList.length){this._presenceList[0]=presence;}else{this._presenceList.push(presence);}
  this.event("resourcePresenceChanged").trigger({fullJid:this.jid,presence:presence,nowAvailable:false});this.event("primaryPresenceChanged").trigger({fullJid:this.jid,presence:(presence.getType()=="unavailable"?null:presence)});return true;},isMe:function(){return(this.room&&this.room.me==this);},room:null},"jabberwerx.MUCOccupant");jabberwerx.MUCOccupantCache=jabberwerx.EntitySet.extend({init:function(room){if(!(room&&room instanceof jabberwerx.MUCRoom)){throw new TypeError("must provide a valid MUCRoom");}
  this._super();this.room=room;},register:function(entity){if(!(entity&&entity instanceof jabberwerx.MUCOccupant)){throw new TypeError("only MUCOccupants can be registered");}
  if(this._super(entity)){this.event("entityCreated").trigger(entity);}},unregister:function(entity){if(!(entity&&entity instanceof jabberwerx.MUCOccupant)){throw new TypeError("only MUCOccupants can be registered");}
  if(this._super(entity)){if(this.room.me===entity){this.room.me=null;}
    this.event("entityDestroyed").trigger(entity);}},_clear:function(){var that=this;jabberwerx.$.each(this.toArray(),function(){that.unregister(this);});},rename:function(entity,njid){this._renameEntity(entity,njid,"");},occupant:function(nick){if(!nick){throw new TypeError("nickname must be a non-empty string");}
  var jid=this.room.jid;jid=new jabberwerx.JID({node:jid.getNode(),domain:jid.getDomain(),resource:nick});return this.entity(jid);},room:null},"jabberwerx.MUCOccupantCache");jabberwerx.MUCRoom=jabberwerx.Entity.extend({init:function(jid,ctrl){if(!(ctrl&&ctrl instanceof jabberwerx.MUCController)){throw new TypeError("MUCController must be provided");}
  this._super({jid:jabberwerx.JID.asJID(jid).getBareJID()},ctrl);this._state="offline";this.occupants=new jabberwerx.MUCOccupantCache(this);this.applyEvent("roomCreated");this.applyEvent("roomEntered");this.applyEvent("roomExited");this.applyEvent("errorEncountered");this.applyEvent("beforeRoomBroadcastSent");this.applyEvent("roomBroadcastSent");this.applyEvent("roomBroadcastReceived");this.applyEvent("beforeRoomSubjectChanging");this.applyEvent("roomSubjectChanging");this.applyEvent("roomSubjectChanged");if(this.controller.client){var client=this.controller.client;client.event("presenceReceived").bindWhen(this.invocation("_filterRoomErrored"),this.invocation("_handleRoomErrored"));client.event("messageReceived").bindWhen(this.invocation("_filterMessageReceived"),this.invocation("_handleMessageReceived"));client.event("presenceSent").bindWhen("presence:not([to]):not([type])",this.invocation("_handlePresenceSent"));}},destroy:function(){this.exit();if(this.controller.client){var client=this.controller.client;client.event("presenceReceived").unbind(this.invocation("_handleRoomErrored"));client.event("messageReceived").unbind(this.invocation("_handleMessageReceived"));client.event("presenceSent").unbind(this.invocation("_handlePresenceSent"));}
  this._super();},getDisplayName:function(){return jabberwerx.JID.unescapeNode(this.jid.getNode());},setDisplayName:function(name){},enter:function(nick,enterArgs){var cbmap=enterArgs?(jabberwerx.$.isFunction(enterArgs)?{successCallback:enterArgs,errorCallback:enterArgs}:enterArgs):{};if(enterArgs&&((cbmap.successCallback&&!jabberwerx.$.isFunction(cbmap.successCallback))||(cbmap.errorCallback&&!jabberwerx.$.isFunction(cbmap.errorCallback))||(cbmap.configureCallback&&!jabberwerx.$.isFunction(cbmap.configureCallback)))){throw new TypeError("Defined callback must be a function");}
  if(!nick||!jabberwerx.util.isString(nick)){throw new TypeError("Nick must be a non-empty string");}
  if(!this.controller.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(this._state=="initializing"){throw new jabberwerx.MUCRoom.RoomActiveError();}else if(this.isActive()){if(this.me&&(this.me.getNickname()!=nick)){throw new jabberwerx.MUCRoom.RoomActiveError();}
    if(cbmap.successCallback){cbmap.successCallback.call(this);}
    return;}
  var that=this;this._state="initializing";var fn=function(evt){if(evt.name=="roomcreated"){that._origApply=that.applyConfig;that.applyConfig=that._creationApply;if(cbmap.configureCallback){cbmap.configureCallback.call(that);}else{that.applyConfig(new jabberwerx.XDataForm("submit"));}}else{if(evt.name=="errorencountered"){that._state="offline";that.exit();if(cbmap.errorCallback){cbmap.errorCallback.call(that,jabberwerx.Stanza.ErrorInfo.createWithNode(evt.data.error),evt.data.aborted);}}else if(evt.name=="roomentered"&&cbmap.successCallback){cbmap.successCallback.call(that);}
    that.event("errorEncountered").unbind(arguments.callee);that.event("roomEntered").unbind(arguments.callee);that.event("roomCreated").unbind(arguments.callee);}};this.event("errorEncountered").bind(fn);this.event("roomEntered").bind(fn);this.event("roomCreated").bind(fn);this.me=new jabberwerx.MUCOccupant(this,nick);var stanza=this.controller.client.getCurrentPresence();if(stanza){stanza=stanza.clone();}else{stanza=new jabberwerx.Presence();stanza.setPresence('','');}
  stanza.setTo(this.me.jid);var builder=new jabberwerx.NodeBuilder(stanza.getNode());var xtag=builder.element("{http://jabber.org/protocol/muc}x");if(enterArgs&&enterArgs.password){xtag.element("password").text(enterArgs.password);}
  this.controller.client.sendStanza(stanza);},exit:function(){if(this.isActive()&&this.controller.client.isConnected()){var stanza=new jabberwerx.Presence();stanza.setTo(this.me.jid);stanza.setType("unavailable");this.controller.client.sendStanza(stanza);}else if(this.me){if(this.isActive()){this._state="offline";this.event("roomExited").trigger();}
  if(this.me!=null){this.me.remove();}}},changeNickname:function(nick,cb){if(this.me&&this.me.getNickname()==nick){return;}
  if(!nick){throw new TypeError("nickname must be a non-empty string");}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be a function or undefined");}
  if(!this.isActive()){throw new jabberwerx.MUCRoom.RoomNotActiveError();}
  var jid=new jabberwerx.JID({node:this.jid.getNode(),domain:this.jid.getDomain(),resource:nick});var stanza=this.controller.client.getCurrentPresence().clone();stanza.setTo(jid);if(cb){var that=this;var fn=function(evt){var err=(evt.name=="errorencountered")?evt.data:undefined;if(err||(evt.name=="entityrenamed"&&evt.data===that.me)){cb.call(that,err);that.event("errorEncountered").unbind(arguments.callee);that.occupants.event("entityRenamed").unbind(arguments.callee);}};this.event("errorEncountered").bind(fn);this.occupants.event("entityRenamed").bind(fn);}
  this.controller.client.sendStanza(stanza);},changeSubject:function(subject,cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be a function or undefined");}
  if(!this.isActive()){throw new jabberwerx.MUCRoom.RoomNotActiveError();}
  var stanza=new jabberwerx.Message();stanza.setTo(this.jid);stanza.setType("groupchat");stanza.setSubject(subject||"");if(cb){var that=this;var fn=function(evt){var err=(evt.name=="errorencountered")?evt.data:undefined;cb.call(that,err);that.event("errorEncountered").unbind(arguments.callee);that.event("roomSubjectChanged").unbind(arguments.callee);};this.event("errorEncountered").bind(fn);this.event("roomSubjectChanged").bind(fn);}
  this.event("beforeRoomSubjectChanging").trigger(stanza);this.controller.client.sendStanza(stanza);this.event("roomSubjectChanging").trigger(stanza);},sendBroadcast:function(msg){if(!msg){return;}
  if(!this.isActive()){throw new jabberwerx.MUCRoom.RoomNotActiveError();}
  var stanza=new jabberwerx.Message();stanza.setTo(this.jid);stanza.setType("groupchat");if(jabberwerx.isElement(msg)||jabberwerx.$.isArray(msg)){stanza.setHTML(msg);}else{stanza.setBody(msg);}
  this.event("beforeRoomBroadcastSent").trigger(stanza);this.controller.client.sendStanza(stanza);this.event("roomBroadcastSent").trigger(stanza);},getPrimaryPresence:function(){if(this.me){return this.getResourcePresence(this.me.getNickname());}
  return null;},isActive:function(){return Boolean(this._state=="active");return Boolean(this.getPrimaryPresence());},updatePresence:function(presence){if(!(presence&&presence instanceof jabberwerx.Presence)){throw new TypeError("must provide a valid non-subscription Presence");}
  var jid=presence.getFromJID();if(jid.getBareJIDString()!=this.jid){throw new TypeError("presence not appropriate to this room");}
  var type=presence.getType()||"";if(type&&type!="unavailable"){throw new TypeError("must provide a valid non-subscription Presence");}
  var node=jabberwerx.$(presence.getNode()).children("x[xmlns^='http://jabber.org/protocol/muc']");var item=node.children("item");var status=node.children("status");var occupant=this.occupants.entity(jid);var result=(occupant&&occupant.isMe());this._removePresenceFromList(jid);switch(type){case"":this._presenceList.push(presence);if(!occupant){occupant=new jabberwerx.MUCOccupant(this,jid.getResource());}
    var prsCount=occupant.getAllPresence().length;occupant.updatePresence(presence);if(occupant.isMe()&&prsCount==0){if(node.children("status[code='201']").length==1){this.event("roomCreated").trigger();return;}else{this._state="active";this.event("roomEntered").trigger();}}
    break;case"unavailable":if(occupant&&occupant.getPrimaryPresence()!==null){if(status.attr("code")=="303"){var nnick=item.attr("nick");var onick=occupant.nick;var njid=new jabberwerx.JID({node:this.jid.getNode(),domain:this.jid.getDomain(),resource:nnick});var tmpprs=presence.clone();this.occupants.rename(occupant,njid);result=false;}else{var myself=occupant.isMe();occupant.updatePresence(presence);if(myself){this._state="offline";this.event("roomExited").trigger();this.occupants._clear();this._presenceList=[];}
    occupant.destroy();}}
    break;}
  this.event("resourcePresenceChanged").trigger({fullJid:jid,presence:presence,nowAvailable:false});if(result){this.event("primaryPresenceChanged").trigger({fullJid:(type!="unavailable")?jid:this.jid,presence:(type!="unavailable")?presence:null});}
  return result;},invite:function(toJids,reason,mediated){if(!this.isActive()){throw new jabberwerx.MUCRoom.RoomNotActiveError();}
  var result=[];if(!reason){reason=jabberwerx.MUCRoom.DefaultInviteReason;}
  if(!toJids){toJids=[];}else if(!jabberwerx.$.isArray(toJids)){toJids=[toJids];}
  var iMsg=new jabberwerx.Message();var updateMessage;updateMessage=function(jid){return iMsg;}
  if(mediated){iMsg.setTo(this.jid);var xe=new jabberwerx.NodeBuilder(iMsg.getNode()).element('{http://jabber.org/protocol/muc#user}x').element('invite');xe.element('reason').text(reason);updateMessage=function(jid){xe.attribute('to',jid.toString());return iMsg;};}else{new jabberwerx.NodeBuilder(iMsg.getNode()).element('{jabber:x:conference}x').attribute("reason",reason).attribute("jid",this.jid.getBareJID().toString());updateMessage=function(jid){iMsg.setTo(jid);return iMsg;};}
  for(var i=0;i<toJids.length;i++){try{var tjid=jabberwerx.JID.asJID(toJids[i]).getBareJID();this.controller.client.sendStanza(updateMessage(tjid));result.push(tjid);}
  catch(ex){if(!(ex instanceof jabberwerx.JID.InvalidJIDError)){throw ex;}}}
  return result;},fetchConfig:function(configCallback){if(!jabberwerx.$.isFunction(configCallback)){throw new TypeError("fetchConfig requires a callback function");}
  if(this._state=="offline"){throw new jabberwerx.MUCRoom.RoomNotActiveError();}
  var qb=new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query').data;this.controller.client.sendIQ("get",this.jid,qb,function(stanza){var iq=new jabberwerx.IQ(stanza);if(iq.isError()){configCallback(null,iq.getErrorInfo());}else{var frm=jabberwerx.$("x",iq.getNode()).get(0);if(!frm){configCallback(null,jabberwerx.Stanza.ERR_SERVICE_UNAVAILABLE);}else{configCallback(new jabberwerx.XDataForm(null,frm));}}});},applyConfig:function(configForm,configCallback){if(configForm&&!(configForm instanceof jabberwerx.XDataForm)){throw new TypeError("configForm must be null or an XDataForm");}
  if(configCallback&&!jabberwerx.$.isFunction(configCallback)){throw new TypeError("A defined configCallback must be a function");}
  if(this._state=="offline"){throw new jabberwerx.MUCRoom.RoomNotActiveError();}
  var cancel=(!configForm||configForm.getType()=="cancel");if(cancel&&configCallback){configCallback();}
  var that=this;var iqcb=cancel?function(stanza){}:function(stanza){if(configCallback){configCallback(new jabberwerx.IQ(stanza).getErrorInfo());}};configForm=configForm?configForm:new jabberwerx.XDataForm("cancel");var nb=new jabberwerx.NodeBuilder('{http://jabber.org/protocol/muc#owner}query');nb.node(configForm.getDOM());this.controller.client.sendIQ("set",this.jid,nb.data,iqcb);},_matchesRoomJid:function(jid){return this.jid.getBareJIDString()==jid.getBareJIDString();},_matchesRoomJid:function(jid){return this.jid.getBareJIDString()==jid.getBareJIDString();},_handlePresenceSent:function(evt){if(this.isActive()){var stanza=evt.data.clone();stanza.setTo(this.me.jid);this.controller.client.sendStanza(stanza);}},_filterRoomErrored:function(data){if((data.pType()=="presence")&&(data.getType()=="error")&&this._matchesRoomJid(data.getFromJID())){return data;}
  return null;},_handleRoomErrored:function(evt){var data=evt.data;var err=jabberwerx.$(data.getNode()).children("error").get(0);var op="";switch(data.pType()){case"message":if(data.getSubject()){op="changeSubject";}else if(data.getBody()){op="sendBroadcast";}
  break;case"presence":if(this.isActive()){op="changeNickname";}else{op="enter";}
  break;}
  if(err){this.event("errorEncountered").trigger({operation:op,error:err});}
  return true;},_filterMessageReceived:function(data){if((data.pType()=="message")&&this._matchesRoomJid(data.getFromJID())){return data;}
  return null;},_handleMessageReceived:function(evt){var stanza=evt.data;switch(stanza.getType()){case"error":this._handleRoomErrored(evt);break;case"groupchat":{var subject=stanza.getSubject();if(subject!==null){this.properties.subject=subject;this.update();this.event("roomSubjectChanged").trigger(stanza);}else{var body=jabberwerx.$.trim(stanza.getBody());if(body){this.event("roomBroadcastReceived").trigger(stanza);}}}
  break;case"chat":if(this.controller.client){var entity=this.occupants.entity(stanza.getFrom());var chat=this.controller.client.controllers.chat;if(chat){if(!chat.getSession(entity.jid)){var session=chat.openSession(entity.jid);session.event('chatReceived').trigger(stanza);}}}
  break;default:break;}
  return true;},_creationApply:function(configForm,configCallback){if(!configForm||(configForm.getType()=="cancel")){this.applyConfig=this._origApply;delete this._origApply;if(configCallback){configCallback();}
  this.applyConfig(configForm);var stanza=new jabberwerx.Presence();stanza.setTo(this.me.jid);stanza.setType("unavailable");this.controller.client.sendStanza(stanza);this.occupants._clear();this._presenceList=[];this.event("errorEncountered").trigger({operation:"enter",error:jabberwerx.Stanza.ERR_BAD_REQUEST.getNode(),aborted:true});}else{var that=this;this._origApply.call(this,configForm,function(cerr){if(configCallback){configCallback(cerr);}
  if(!cerr){that.applyConfig=that._origApply;delete that._origApply;that._state="active";that.event("roomEntered").trigger();that._presenceList[0]
    that.event("resourcePresenceChanged").trigger({fullJid:that.me.jid,presence:that._presenceList[0],nowAvailable:false});that.event("primaryPresenceChanged").trigger({fullJid:that.me.jid,presence:that._presenceList[0]});}});}},_state:"offline",occupants:null,me:null},"jabberwerx.MUCRoom");jabberwerx.MUCRoom.RoomActiveError=jabberwerx.util.Error.extend("room already active");jabberwerx.MUCRoom.RoomNotActiveError=jabberwerx.util.Error.extend("room is not active");jabberwerx.MUCRoom.DefaultInviteReason="You have been invited to a conference room.";jabberwerx.MUCRoom.DefaultSubjectChange="has changed the subject to: {0}";})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Server.js*/
;(function(jabberwerx){jabberwerx.Server=jabberwerx.Entity.extend({init:function(serverDomain,cache){this._super({jid:serverDomain},cache);}},'jabberwerx.Server');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/Contact.js*/
;(function(jabberwerx){jabberwerx.Contact=jabberwerx.User.extend({init:function(jid,ctrl){this._super(jid,ctrl);}},"jabberwerx.Contact");jabberwerx.RosterContact=jabberwerx.Contact.extend({init:function(item,roster,base){if(!(roster&&roster instanceof jabberwerx.RosterController)){throw new TypeError("roster must be provided");}
  if(base&&!(base instanceof jabberwerx.Entity)){throw new TypeError("Provided base must be an entity");}
  this._super(jabberwerx.$(item).attr("jid"),roster);this._initializing=true;this.setItemNode(item);if(base){this.properties=jabberwerx.$.extend(true,this.properties,base.properties);this.features=jabberwerx.$.extend(this.features,base.features);this.identities=jabberwerx.$.extend(this.identities,base.identities);this._groups=jabberwerx.$.extend(this._groups,base._groups);this._presenceList=jabberwerx.$.extend([],base._presenceList);if(!this._displayName){this._displayName=base._displayName;}}
  delete this._initializing;},setItemNode:function(node){if(!(node&&jabberwerx.isElement(node))){throw new TypeError("node cannot be null");}
  if(this._node!==node){this._node=node;node=jabberwerx.$(node);var oldSub=this.properties.subscription;this.properties.subscription=node.attr("subscription")||"";this.properties.ask=node.attr("ask")||"";this.properties.name=node.attr("name")||"";var newSub=this.properties.subscription;if(!(!oldSub||oldSub=="from"||oldSub=="none")&&(!newSub||newSub=="from"||newSub=="none")){this.updatePresence(null,true);}else if(!(!newSub||newSub=="from"||newSub=="none")&&!this.getPrimaryPresence()){var prs=new jabberwerx.Presence();prs.setType("unavailable");var jid=jabberwerx.JID.asJID(node.attr("jid")).getBareJID();prs.setFrom(jid);this.updatePresence(prs,true);}
    this._displayName=this.properties.name;this._groups=node.children("group").map(function(){return jabberwerx.$(this).text();}).get()||[];if(!this._initializing&&this._eventing["updated"]){this._eventing["updated"].trigger(this);}}},getItemNode:function(){return this._node;},getDisplayName:function(){return this.properties.name||this._super();},setDisplayName:function(name){if(name!=this._displayName){this.controller.updateContact(this.jid,name);}},setGroups:function(groups){this.controller.updateContact(this.jid,null,groups);},remove:function(){this.controller.deleteContact(this.jid);},_handleUnavailable:function(presence){if(this.properties.subscription=="both"||this.properties.subscription=="to"||this.properties.temp_sub){var pres=this.getPrimaryPresence();if(!pres){this._insertPresence(presence);}else if(pres.getType()=="unavailable"){this._clearPresenceList();this._insertPresence(presence);}}},_node:null},'jabberwerx.RosterContact');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/TemporaryEntity.js*/
;(function(jabberwerx){jabberwerx.TemporaryEntity=jabberwerx.Entity.extend({init:function(jid,cache){this._super({jid:jid},cache);}},'jabberwerx.TemporaryEntity');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/ErrorReporter.js*/
;(function(jabberwerx){jabberwerx.ErrorReporter=jabberwerx.JWBase.extend({init:function(){this._super();},getMessage:function(err){if(err){if(jabberwerx.isElement(err)){var msg;var textMsg;for(var i=0;i<err.childNodes.length;i++){var node=err.childNodes[i];if(node.nodeName=='text'){textMsg=jabberwerx.$(node).text();}else{var error='{'+node.getAttribute('xmlns')+'}'+node.nodeName;msg=this._errorMap[error];if(msg){return msg;}}}
  if(textMsg){return textMsg;}}else if(err.message){var msg=this._errorMap[err.message];if(msg){return msg;}}}
  return this._errorMap[""];},addMessage:function(key,value){if(!value||typeof(value)!="string"){throw new TypeError("value must be a string.");}
  if(key){this._errorMap[key]=value;}},_errorMap:{"":"Operation failed","{urn:ietf:params:xml:ns:xmpp-sasl}mechanism-too-weak":"You are not authorized to perform this action.","{urn:ietf:params:xml:ns:xmpp-sasl}not-authorized":"Invalid user name or password.","{urn:ietf:params:xml:ns:xmpp-sasl}temporary-auth-failure":"Unable to login. Check username and password.","{urn:ietf:params:xml:ns:xmpp-stanzas}bad-request":"The request was not valid.","{urn:ietf:params:xml:ns:xmpp-stanzas}conflict":"Conflicting names were encountered.","{urn:ietf:params:xml:ns:xmpp-stanzas}feature-not-implemented":"This feature is not yet implemented. Sorry for the inconvenience.","{urn:ietf:params:xml:ns:xmpp-stanzas}forbidden":"You are not authorized to perform this action.","{urn:ietf:params:xml:ns:xmpp-stanzas}internal-server-error":"An unknown server error occurred. Contact your administrator.","{urn:ietf:params:xml:ns:xmpp-stanzas}item-not-found":"The requested item could not be found.","{urn:ietf:params:xml:ns:xmpp-stanzas}jid-malformed":"The JID is not valid.","{urn:ietf:params:xml:ns:xmpp-stanzas}not-acceptable":"The given information was not acceptable.","{urn:ietf:params:xml:ns:xmpp-stanzas}not-allowed":"You are not allowed to perform this action.","{urn:ietf:params:xml:ns:xmpp-stanzas}not-authorized":"You are not authorized to perform this action.","{urn:ietf:params:xml:ns:xmpp-stanzas}registration-required":"You must register with the service before continuing.","{urn:ietf:params:xml:ns:xmpp-stanzas}remote-server-not-found":"Could not find the requested server.","{urn:ietf:params:xml:ns:xmpp-stanzas}remote-server-timeout":"Unable to contact the server.","{urn:ietf:params:xml:ns:xmpp-stanzas}service-unavailable":"This service is not available. Try again later.","{urn:ietf:params:xml:ns:xmpp-stanzas}undefined-condition":"An unknown error occurred. Contact your administrator.","{urn:ietf:params:xml:ns:xmpp-stanzas}unexpected-request":"Did not expect the request at this time.","{urn:ietf:params:xml:ns:xmpp-streams}conflict":"This resource is logged in elsewhere.","{urn:ietf:params:xml:ns:xmpp-streams}service-unavailable":"Could not reach the account server."}},"jabberwerx.ErrorReporter");jabberwerx.errorReporter=new jabberwerx.ErrorReporter();})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/ChatSession.js*/
;(function(jabberwerx){jabberwerx.ChatSession=jabberwerx.JWModel.extend({init:function(client,jid,thread){this._super();this._statesReady=false;if(client instanceof jabberwerx.Client){this.client=client;this.controller=client.controllers.chat||new jabberwerx.ChatController(client);}else{throw new TypeError("client must be a jabberwerx.Client");}
  this.jid=jabberwerx.JID.asJID(jid);if(!thread){thread=this._generateRandomThreadValue();}
  this.thread=thread;this.applyEvent('beforeChatSent');this.applyEvent('chatSent');this.applyEvent('chatReceived');this.applyEvent('threadUpdated');this.applyEvent('chatStateChanged');this.applyEvent('lockedResourceChanged');this.privateMessage=this.controller.isPrivateMessage(this.jid);if(this.privateMessage){this._MUCController=client.controllers.muc||new jabberwerx.MUCController(client);}
  this._bindHandlers();var handlerFunc=this.invocation("_entityChangedHandler");this._getEntitySet().event("entityCreated").bind(handlerFunc);this._getEntitySet().event("entityDestroyed").bind(handlerFunc);if(this.privateMessage){this._getEntitySet().event("entityRenamed").bind(this.invocation("_entityRenamedHandler"));}},_bindHandlers:function(){this._handlerList=[{event:"messageReceived",filter:this.invocation("_chatReceivedFilter"),handler:this.invocation("_chatReceivedHandler")},{event:"messageReceived",filter:this.invocation("_remoteStateChangedFilter"),handler:this.invocation("_remoteStateChangedHandler")},{event:"presenceReceived",filter:this.invocation("_presenceReceivedFilter"),handler:this.invocation("_presenceChangeHandler")}];var evt,client=this.client;for(var idx=0;idx<this._handlerList.length;idx++){evt=this._handlerList[idx];client.event(evt.event).bindWhen(evt.filter,evt.handler);}},_getEntitySet:function(){if(this.privateMessage){return this._MUCController.room(this.jid).occupants;}else{return this.client.entitySet;}},getEntity:function(){if(!this._entity){if(this.privateMessage){this._entity=this._getEntitySet().entity(this.jid);}else{var jid=this.jid.getBareJID();this._entity=this._getEntitySet().entity(jid)||new jabberwerx.TemporaryEntity(jid,this._getEntitySet());}}
  return this._entity;},_entityChangedHandler:function(evt){if(this.privateMessage&&(this.jid.toString()!=evt.data.jid.toString())){return;}
  if(this.jid.getBareJIDString()!=evt.data.jid.getBareJIDString()){return;}
  switch(evt.name.substring("entity".length)){case"destroyed":this._entity=undefined;break;case"created":this._entity=evt.data;break;}},_entityRenamedHandler:function(evt){if(evt.data.jid&&(evt.data.jid==this.jid)){this.jid=evt.data.entity.jid;this._unbindHandlers();this._bindHandlers();}},sendMessage:function(body){if(!body){return;}
  this._statesReady=true;var msg=this._generateMessage('active',body);this.localState='active';this.event('chatStateChanged').trigger({jid:null,state:this.localState});this.event('beforeChatSent').trigger(msg);this.client.sendStanza(msg);this.event('chatSent').trigger(msg);},setChatState:function(state){var retVal=false;if(this._setChatStateProperty(state)){retVal=true;var msg=this._generateMessage(state);if(msg&&this.client.isConnected()){this.client.sendStanza(msg);}}
  return retVal;},_setChatStateProperty:function(state){var retVal=false;if(jabberwerx.$.inArray(state,['active','composing','paused','inactive','gone'])>=0){if(state!=this.localState){this.localState=state;this.event('chatStateChanged').trigger({jid:null,state:this.localState});retVal=true;}}else{var err=new jabberwerx.ChatSession.StateNotSupportedError("The chat state '"
  +state+"' is not supported. Should be one of 'active', 'composing',"+"'paused', 'inactive' or 'gone'");throw err;}
  return retVal;},destroy:function(){this._unbindHandlers();var handlerFunc=this.invocation("_entityChangedHandler");this._getEntitySet().event("entityCreated").unbind(handlerFunc);this._getEntitySet().event("entityDestroyed").unbind(handlerFunc);if(this.privateMessage){this._getEntitySet().event("entityRenamed").unbind(this.invocation("_entityRenamedHandler"));}
  this.setChatState('gone');this.controller.closeSession(this);this._super();},_unbindHandlers:function(){var client=this.client;jabberwerx.$.each(this._handlerList,function(){client.event(this.event).unbind(this.handler);});},_generateMessage:function(chatstate,body){if(!this._statesReady){return null;}
  var msg=null;if(body){msg=new jabberwerx.Message();msg.setThread(this.thread);if(jabberwerx.isElement(body)||jabberwerx.$.isArray(body)){msg.setHTML(body);}else{msg.setBody(body);}}
  if(this.controller.sendChatStates){msg=msg||new jabberwerx.Message();var nodeBuilder=new jabberwerx.NodeBuilder(msg.getNode());nodeBuilder.element('{http://jabber.org/protocol/chatstates}'+chatstate);}
  if(msg){msg.setType('chat');msg.setTo(this.jid);}
  return msg;},_matchesSessionJid:function(jid){return(this.privateMessage)?jid.toString()==this.jid.toString():jid.getBareJIDString()==this.jid.getBareJIDString();},_chatReceivedFilter:function(data){if((data.pType()=="message")&&(data.getType()!="groupchat")&&this._matchesSessionJid(data.getFromJID())){return data;}
  return false;},_chatReceivedHandler:function(eventObj){var msg=eventObj.data;this._updateLockedResource(msg.getFromJID());this._updateThread(msg.getThread());this._statesReady=!msg.isError();if(msg.getBody()||msg.isError()){this.event('chatReceived').trigger(msg);}
  return false;},_updateLockedResource:function(jid){if(this.privateMessage){return;}
  if(jid.getResource()!=this.jid.getResource()){this.jid=jid;this.event('lockedResourceChanged').trigger(this.jid);}},_updateThread:function(thread){if(thread&&thread!=this.thread){this.thread=thread;this.event('threadUpdated').trigger({jid:this.jid,thread:this.thread});}},_remoteStateChangedFilter:function(data){if((data.pType()=="message")&&(data.getType()=="chat")&&this._matchesSessionJid(data.getFromJID())){return jabberwerx.$(data.getNode()).find("*[xmlns='http://jabber.org/protocol/chatstates']").get(0);}
  return false;},_remoteStateChangedHandler:function(eventObj){var stateNode=eventObj.selected;if(this.remoteState!=stateNode.nodeName){this.remoteState=stateNode.nodeName;this.event('chatStateChanged').trigger({jid:this.jid,state:this.remoteState});if(this.remoteState=="gone"){this._updateLockedResource(eventObj.data.getFromJID().getBareJID());this.thread=this._generateRandomThreadValue();}}
  return false;},_presenceChangeHandler:function(eventObj){this._updateLockedResource(eventObj.data.getFromJID().getBareJID());return false;},_generateRandomThreadValue:function(){var chars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";var string_length=10;var threadValue='';for(var i=0;i<string_length;i++){var rnum=Math.floor(Math.random()*chars.length);threadValue+=chars.substring(rnum,rnum+1);}
  return'JW_'+threadValue;},_presenceReceivedFilter:function(presence){var type=presence.getType();if(this._matchesSessionJid(presence.getFromJID())&&(!type||type=='unavailable')){return presence;}
  return false;},jid:null,thread:null,localState:null,remoteState:null,client:null,controller:null,privateMessage:false,_handlerList:[]},'jabberwerx.ChatSession');jabberwerx.ChatSession.StateNotSupportedError=jabberwerx.util.Error.extend();})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/PrivacyList.js*/
;(function(jabberwerx){jabberwerx.PrivacyList=jabberwerx.JWModel.extend({init:function(listNode,ctrl){this._super();if(!jabberwerx.isElement(listNode)){throw new TypeError("listNode must be an Element");}
  this._DOM=jabberwerx.$(listNode);if(!(ctrl&&ctrl instanceof jabberwerx.PrivacyListController)){throw new TypeError("controller must be a PrivacyListController");}
  this.controller=ctrl;},destroy:function(){this.controller._remove(this.getName());this._super();},getName:function(){return this._DOM.attr("name");},getBlockedJids:function(){var fn=function(){var item=jabberwerx.$(this);if(item.attr("type")!="jid"){return null;}
  if(item.attr("action")!="deny"){return null;}
  return jabberwerx.JID.asJID(item.attr("value"));};return this._DOM.children().map(fn).get();},getBlockedStanzas:function(jid){jid=jabberwerx.JID.asJID(jid).getBareJIDString();var stanzas=[];var item=this._getMatchingItem(this._DOM.get(0),jid);if(item){item.children().each(function(i){stanzas.push(this.tagName);});if(!stanzas.length){stanzas.push(jabberwerx.PrivacyList.ALL);}}
  return stanzas;},blockJid:function(jid,stanzas){jid=jabberwerx.JID.asJID(jid).getBareJIDString();if(!this._cleanDOM){this._cleanDOM=jabberwerx.$(this._DOM.get(0).cloneNode(true));}
  var item=this._getMatchingItem(this._DOM.get(0),jid);if(!item){item=new jabberwerx.NodeBuilder(this._DOM.get(0)).element("item").attribute("action","deny").attribute("type","jid").attribute("value",jid);item=jabberwerx.$(item.data);}else{item.attr("action","deny");item.empty();}
  var isBlockedJID=false;if(stanzas){if(!jabberwerx.$.isArray(stanzas)){throw new TypeError("stanzas is defined but not an array.");}
    var itemNode=new jabberwerx.NodeBuilder(item.get(0));for(var i=0;i<stanzas.length;i++){var stanzaItem=stanzas[i];if(!this._validStanzaType(stanzaItem)){throw new TypeError("Item in stanza list is not valid.");}
      if(stanzaItem==jabberwerx.PrivacyList.ALL){item.empty();isBlockedJID=true;break;}
      if(stanzaItem==jabberwerx.PrivacyList.PRESENCE_OUT){isBlockedJID=true;}
      itemNode.element(stanzaItem);}}else{isBlockedJID=true;}
  this._DOM.prepend(item);if(isBlockedJID){this._updateDirty(jid,this._blocked,this._unblocked);}},_validStanzaType:function(stanza){if(stanza==jabberwerx.PrivacyList.MESSAGE||stanza==jabberwerx.PrivacyList.IQ||stanza==jabberwerx.PrivacyList.PRESENCE_IN||stanza==jabberwerx.PrivacyList.PRESENCE_OUT||stanza==jabberwerx.PrivacyList.ALL){return true;}
  return false;},unblockJid:function(jid){jid=jabberwerx.JID.asJID(jid).getBareJIDString();var item=this._getMatchingItem(this._DOM.get(0),jid);if(item){if(!this._cleanDOM){this._cleanDOM=jabberwerx.$(this._DOM.get(0).cloneNode(true));}
  item.remove();this._updateDirty(jid,this._unblocked,this._blocked);}},_getMatchingItem:function(dom,jid){jid=jabberwerx.JID.asJID(jid).getBareJIDString();var result=null;jabberwerx.$.map(jabberwerx.$.find("item[type='jid']",dom),function(aItem,aIndex){aItem=jabberwerx.$(aItem);var tjid=aItem.attr("value");if(tjid){tjid=jabberwerx.JID.asJID(tjid).getBareJIDString();if(tjid===jid){result=aItem;}}});return result;},_update:function(listNode){this._DOM=jabberwerx.$(listNode);this._blocked=[];this._unblocked=[];},_updateDirty:function(jid,added,remed){var idxOf=function(arr){for(var idx=0;idx<arr.length;idx++){if(arr[idx]==jid){return idx;}}
  return-1;};var idx;idx=idxOf(remed);if(idx!=-1){remed.splice(idx,0);}
  idx=idxOf(added);if(idx==-1){added.push(jid);}},update:function(cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  var items=this._DOM.children();if(!items.length){new jabberwerx.NodeBuilder(this._DOM.get(0)).element("item").attribute("action","allow");items=this._DOM.children();}
  items.each(function(idx){jabberwerx.$(this).attr("order",idx);});var ctrl=this.controller;var client=ctrl.client;var prs=new jabberwerx.Presence();prs.setType("unavailable");for(var idx=0;idx<this._blocked.length;idx++){var jid=this._blocked[idx];var ent=client.entitySet.entity(jid);if(!ent){continue;}
    if(!ent.getPrimaryPresence()){continue;}
    if((ent instanceof jabberwerx.RosterContact)&&((ent.properties.subscription!="from")||(ent.properties.subscription!="both"))){continue;}
    prs.setTo(jid);client.sendStanza(prs);}
  var blocked=this._blocked;var unblocked=this._unblocked;var that=this;var fn=function(evt){var prs=client.getCurrentPresence().clone();prs.setFrom();prs.setTo();switch(evt.name){case"errorencountered":if(blocked.length){client.sendStanza(prs);}
    if(cb){cb.call(that,evt.data.error);}
    break;case"privacylistupdated":if(unblocked.length){client.sendStanza(prs);}
    if(cb){cb.call(that);}
    break;}
    ctrl.event("errorEncountered").unbind(arguments.callee);ctrl.event("privacyListUpdated").unbind(arguments.callee);};ctrl.event("errorEncountered").bindWhen(function(data){return(data.target===that)?that:null},fn);ctrl.event("privacyListUpdated").bindWhen(function(data){return(data===that)?that:null},fn);var query=new jabberwerx.NodeBuilder("{jabber:iq:privacy}query");query=jabberwerx.$(query.data);query.append(this._DOM.get(0).cloneNode(true));client.sendIq("set",null,query.get(0),function(stanza){var err=new jabberwerx.IQ(stanza).getErrorInfo();if(err&&that._cleanDOM){that._DOM=that._cleanDOM;ctrl.event("errorEncountered").trigger({operation:"update",target:that,error:err.getNode()});}
    delete that._cleanDOM;});},remove:function(cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  if(cb){var ctrl=this.controller;var that=this;var fn=function(evt){var err=(evt.name=="errorencountered")?evt.data.error:undefined;cb.call(that,err);ctrl.event("errorEncountered").unbind(arguments.callee);ctrl.event("privacyListRemoved").unbind(arguments.callee);};ctrl.event("errorEncountered").bindWhen(function(data){return(data.target===that)?that:null;},fn);ctrl.event("privacyListRemoved").bindWhen(function(data){return(data===that)?that:null;},fn);}
  var query=new jabberwerx.NodeBuilder("{jabber:iq:privacy}query").element("list").attribute("name",this.getName()).parent;this.controller.client.sendIq("set",null,query.data);},willBeSerialized:function(){if(this._DOM){this._serializedXML=this._DOM.get(0).xml;delete this._DOM;}},wasUnserialized:function(){if(this._serializedXML){this._DOM=jabberwerx.$(jabberwerx.util.unserializeXML(this._serializedXML));delete this._serializedXML;}},_blocked:[],_unblocked:[],_DOM:null},"jabberwerx.PrivacyList");jabberwerx.PrivacyList.MESSAGE="message";jabberwerx.PrivacyList.IQ="iq";jabberwerx.PrivacyList.PRESENCE_IN="presence-in";jabberwerx.PrivacyList.PRESENCE_OUT="presence-out";jabberwerx.PrivacyList.ALL="all";})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/PubSubNode.js*/
;(function(jabberwerx){jabberwerx.PubSubItem=jabberwerx.JWModel.extend({init:function(dom){this._super();this._update(dom);},destroy:function(){this._super();},willBeSerialized:function(){this.timestamp=this.timestamp.getTime();},wasUnserialized:function(){this.timestamp=new Date(this.timestamp);},_update:function(dom){dom=jabberwerx.$(dom);var val;val=dom.attr("publisher");this.publisher=(val)?jabberwerx.JID.asJID(val):null;val=dom.attr("timestamp");this.timestamp=(val)?jabberwerx.parseTimestamp(val):new Date();this.id=dom.attr("id");this.data=dom.children().get(0);},id:null,publisher:null,timestamp:null,data:null},"jabberwerx.PubSubItem");jabberwerx.PubSubNode=jabberwerx.Entity.extend({init:function(jid,node,ctrl){if(!node||typeof(node)!="string"){throw new TypeError("node must be a non-empty string");}
  if(ctrl instanceof jabberwerx.PubSubNode){this.delegate=ctrl;ctrl=ctrl.controller;}
  if(!(ctrl instanceof jabberwerx.PubSubController)){throw new TypeError("ctrl must be a jabberwerx.PubSubController or jabberwerx.PubSubNode");}
  this._super({jid:jid,node:node},ctrl);this._cacheItems=true;this.properties.items=[];this.properties.delegated={};this.applyEvent("pubsubNodeCreated");this.applyEvent("pubsubNodeDeleted");this.applyEvent("pubsubItemsChanged");this.applyEvent("errorEncountered");if(!this.delegate){this.controller.client.event("beforeMessageReceived").bindWhen("event[xmlns='http://jabber.org/protocol/pubsub#event']>*[node='"+this.node+"']",this.invocation("_handleNotify"));}},destroy:function(){if(!this.delegate){this.controller.client.event("beforeMessageReceived").unbind(this.invocation("_handleNotify"));}
  if(this.properties.delegated){var client=this.controller.client;for(var key in this.properties.delegated){var d=client.entitySet.entity(key,this.node);if(d){d.destroy();}}}
  this._super();},setCachingItems:function(enable){this._cacheItems=(enable===true);if(!this._cacheItems){this.properties.items=[];}},isCachingItems:function(){return this._cacheItems===true;},getItems:function(){return jabberwerx.$.extend([],this.properties.items);},getDelegatedFor:function(jid){if(this.delegate){throw new jabberwerx.PubSubNode.DelegatedNodeError();}
  jid=jabberwerx.JID.asJID(jid).getBareJID();if(jid.equals(this.jid)){return this;}
  var delegated=this.controller.node(this.node,jid);delegated.delegate=this;this.properties.delegated[jid.toString()]=true;return delegated;},subscribe:function(cb){var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  if(this.properties.subscription||this.delegate){if(cb){cb.call(this,null,this);}
    return;}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");query.element("subscribe").attribute("node",this.node).attribute("jid",client.connectedUser.jid+"/"+client.resourceName);var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"subscribe",error:err});if(cb){cb.call(that,err,null);}}else{that.properties.subscription="explicit";if(that.autoRetrieve){that.retrieve(cb);}else if(cb){cb.call(that,null,that);}}});},unsubscribe:function(cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  if(this.delegate){if(cb){cb.call(this);}
    return;}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");query.element("unsubscribe").attribute("node",this.node).attribute("jid",client.connectedUser.jid+"/"+client.resourceName);var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){var notSub=jabberwerx.$(err).children("not-subscribed[xmlns='http://jabber.org/protocol/pubsub#errors']");if(!notSub.length){that.event("errorEncountered").trigger({operation:"unsubscribe",error:err});}
    err=undefined;}
    delete that.properties.subscription;that._cleanItems();if(cb){cb.call(that,err);}});},retrieve:function(cb){var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");query.element("items").attribute("node",this.node);var that=this;client.sendIq("get",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"retrieve",error:err});if(cb){cb.call(that,err,that);}}else{var items=jabberwerx.$(stanza).find("pubsub[xmlns='http://jabber.org/protocol/pubsub']>items");that._cleanItems();that.properties.items=[];that._updateItems(items);if(cb){cb.call(that,null,that);}}});},publish:function(id,payload,cb){if(this.delegate){throw new jabberwerx.PubSubNode.DelegatedError();}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  if(payload&&!jabberwerx.isElement(payload)){throw new TypeError("payload must be undefined or an element");}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");var item=query.element("publish").attribute("node",this.node).element("item");if(id){item.attribute("id",id);}
  if(payload){item.node(payload);}
  var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"publish",error:err});}else{var published=jabberwerx.$(stanza).find("item");if(published&&published.length!=0){id=jabberwerx.$(published).attr("id");}}
    if(cb){cb.call(that,err,id);}});},retract:function(id,cb){if(this.delegate){throw new jabberwerx.PubSubNode.DelegatedError();}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(!(id&&typeof(id)=="string")){throw new TypeError("id must be a non-empty string");}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");var item=query.element("retract").attribute("node",this.node).attribute("notify","true").element("item");item.attribute("id",id);var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"retract",error:err});}
    if(cb){cb.call(that,err);}});},_purge:function(cb){if(this.delegate){throw new jabberwerx.PubSubNode.DelegatedError();}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");query.element("purge").attribute("node",this.node);var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"purge",error:err});}
    if(cb){cb.call(that,err);}});},createNode:function(cb){if(this.delegate){throw new jabberwerx.PubSubNode.DelegatedNodeError();}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}pubsub");query.element("create").attribute("node",this.node);var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"createNode",error:err});}else{that.event("pubsubNodeCreated").trigger();}
    if(cb){cb.call(that,err);}});},deleteNode:function(cb){if(this.delegate){throw new jabberwerx.PubSubNode.DelegatedNodeError();}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub#owner}pubsub");query.element("delete").attribute("node",this.node);this._deletePending=true;var that=this;client.sendIq("set",this.jid,query.data,function(stanza){var err=that._checkError(stanza);if(err){that.event("errorEncountered").trigger({operation:"deleteNode",error:err});}else{that._cleanItems();that.event("pubsubNodeDeleted").trigger();}
    delete that._deletePending;if(cb){cb.call(that,err);}});},fetchAffiliations:function(cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be a function or undefined");}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub#owner}pubsub");query.element("affiliations").attribute("node",this.node);var that=this;this.controller.client.sendIq("get",this.jid,query.data,function(stanza){var iq=new jabberwerx.IQ(stanza);if(iq.isError()){cb.call(that,null,jabberwerx.$(iq.getNode()).children("error").get(0));}else{var affiliations=jabberwerx.$(stanza).find("pubsub[xmlns='http://jabber.org/protocol/pubsub#owner']>affiliations");var _affiliationsMap={};jabberwerx.$.each(affiliations.children(),function(){var jid=jabberwerx.$(this).attr("jid");var aff=jabberwerx.$(this).attr("affiliation");_affiliationsMap[jid]=aff;});cb.call(that,_affiliationsMap);}});},updateAffiliation:function(jid,affiliation,cb){if(!affiliation){throw new TypeError("affiliation must be a non-empty string");}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be a function or undefined");}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub#owner}pubsub");var affiliations=query.element("affiliations").attribute("node",this.node);affiliations.element("affiliation").attribute("jid",jid).attribute("affiliation",affiliation);var that=this;this.controller.client.sendIq("set",this.jid,query.data,function(stanza){var iq=new jabberwerx.IQ(stanza);if(iq.isError()){cb.call(that,jabberwerx.$(iq.getNode()).children("error").get(0));}else{cb.call(that);}});},_cleanItems:function(){if(!this.properties.items.length){return;}
  var items=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub}items");jabberwerx.$.each(this.properties.items,function(){items.element("retract").attribute("id",this.id);});this._updateItems(jabberwerx.$(items.data));},_checkError:function(stanza){return jabberwerx.$(stanza).children("error").get(0);},_handleNotify:function(evt){var publisher=evt.data.getFromJID().getBareJID();if(this.jid&&!this.jid.equals(publisher)){return false;}
  var delegated=(this.delegate)?this:this.getDelegatedFor(publisher);if(delegated!==this){return delegated._handleNotify(evt);}
  var selected=evt.selected;var items;var gone=false;var addrs=jabberwerx.$(evt.data.getNode()).children("addresses[xmlns='http://jabber.org/protocol/address']");var publisher=addrs.find("address[type='replyto']").attr("jid");switch(selected.nodeName){case"items":this._updateItems(jabberwerx.$(selected),publisher);break;case"delete":gone=true;case"purge":this._cleanItems();break;}
  if(gone&&!this._deletePending){this.event("pubsubNodeDeleted").trigger();}
  return true;},_updateItems:function(items,publisher){var that=this;var added=[],upped=[],remed=[];jabberwerx.$.each(items.children(),function(){var id=jabberwerx.$(this).attr("id");var key="item:"+id;var it;if(!that._cacheItems){it=new jabberwerx.PubSubItem(this);if(this.nodeName=="retract"){remed.push(it);}else if(this.nodeName=="item"){added.push(it);}}
else if(this.nodeName=="retract"){it=that.properties.items[key];if(it){remed.push(it);var idx=jabberwerx.$.inArray(it,that.properties.items);delete that.properties.items[key];that.properties.items.splice(idx,1);}}else if(this.nodeName=="item"){if(publisher&&!jabberwerx.$(this).attr("publisher")){jabberwerx.$(this).attr("publisher",publisher);}
  it=that.properties.items[key];if(it){it._update(this);upped.push(it);}else{it=new jabberwerx.PubSubItem(this);that.properties.items.push(it);that.properties.items[key]=it;added.push(it);}}});var delegate=(this.delegate)?this.delegate.event("pubsubItemsChanged"):undefined;if(added.length){this.event("pubsubItemsChanged").trigger({operation:"added",items:added},delegate);}
  if(upped.length){this.event("pubsubItemsChanged").trigger({operation:"updated",items:upped},delegate);}
  if(remed.length){this.event("pubsubItemsChanged").trigger({operation:"removed",items:remed},delegate);}
  this.update();},fetchConfig:function(cb){if(!jabberwerx.$.isFunction(cb)){throw new TypeError("fetchConfig requires a callback function");}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  var query=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/pubsub#owner}pubsub");query.element("configure").attribute("node",this.node);client.sendIq("get",this.jid,query.data,function(stanza){var iq=new jabberwerx.IQ(stanza);if(iq.isError()){cb(null,iq.getErrorInfo());}else{var frm=jabberwerx.$("configure>x",iq.getNode()).get(0);if(!frm){cb(null,jabberwerx.Stanza.ERR_SERVICE_UNAVAILABLE);}else{cb(new jabberwerx.XDataForm(null,frm));}}});},applyConfig:function(form,cb){if(form&&!(form instanceof jabberwerx.XDataForm)){throw new TypeError("supplied applyConfig form must be null or an XDataForm");}
  if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("defined applyConfig callback must be a function");}
  var client=this.controller.client;if(!client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  form=form||new jabberwerx.XDataForm("cancel");var frmDOM=form.getDOM();if(form.getType()!="cancel"&&form.getType()!="submit"){jabberwerx.$(frmDOM).attr("type","submit");}
  var nb=new jabberwerx.NodeBuilder('{http://jabber.org/protocol/pubsub#owner}pubsub');nb.element("configure").attribute("node",this.node).node(frmDOM);this.controller.client.sendIQ("set",this.jid,nb.data,function(stanza){if(cb){cb(new jabberwerx.IQ(stanza).getErrorInfo());}});},autoRetrieve:false},"jabberwerx.PubSubNode");jabberwerx.PubSubNode.DelegatedNodeError=jabberwerx.util.Error.extend.call(jabberwerx.util.NotSupportedError,"this operation is not supported by delegated nodes");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/PEPNode.js*/
;(function(jabberwerx){jabberwerx.PEPNode=jabberwerx.PubSubNode.extend({init:function(jid,node,ctrl){this._super(jid,node,ctrl);},destroy:function(){this.unsubscribe();this._super();},subscribe:function(cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  if(!this.delegate){var caps=this.controller.client.controllers.capabilities;if(this.jid){caps.addFeatureToJid(this.jid,this.node+"+notify");}else{caps.addFeature(this.node+"+notify");}
    this.properties.subscription="implicit";}
  if(this.autoRetrieve){this.retrieve();}
  if(cb){cb.call(this);}},unsubscribe:function(cb){if(cb&&!jabberwerx.$.isFunction(cb)){throw new TypeError("callback must be undefined or a function");}
  if(this.delegate){if(cb){cb.call(this);}
    return;}
  var caps=this.controller.client.controllers.capabilities;if(this.jid){caps.removeFeatureFromJid(this.jid,this.node+"+notify");}else{caps.removeFeature(this.node+"+notify");}
  delete this.properties.subscription;},setCachingItems:function(enable){throw new jabberwerx.util.NotSupportedError();},createNode:function(cb){throw new jabberwerx.util.NotSupportedError();},deleteNode:function(cb){throw new jabberwerx.util.NotSupportedError();}},"jabberwerx.PEPNode");jabberwerx.PEPNode.CURRENT_ITEM="current";})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/XDataForm.js*/
;(function(jabberwerx){jabberwerx.XDataForm=jabberwerx.JWModel.extend({init:function(form,payload){this._super();if(payload){if(jabberwerx.isElement(payload)){payload=jabberwerx.$(payload);this._type=payload.attr("type");this._title=payload.children("title").text();this._instructions=payload.children("instructions").text();var that=this;var fields=payload.children("field");var field;jabberwerx.$.each(fields,function(){field=new jabberwerx.XDataFormField(null,null,this);that.addField(field);});var reported_fields=payload.find("reported:first  > field");var reported_field;jabberwerx.$.each(reported_fields,function(){reported_field=new jabberwerx.XDataFormField(null,null,this);that.reported.push(reported_field);});var items=payload.find("item");var item;jabberwerx.$.each(items,function(){item=new jabberwerx.XDataFormItem(this);jabberwerx.$.each(that.reported,function(){var field=item.getFieldByVar(this.getVar());if(field){field.setType(this.getType());field.setOptions(this.getOptions());field.setDesc(this.getDesc());}});that.items.push(item);});}
else{throw new TypeError("payload needs to be an Element");}}else{if(form){if(typeof form=='string'){this._type=form;}
else{throw new TypeError("string form type is required");}}
else{this._type='form';}}},destroy:function(){this._super();},getType:function(){return this._type;},getTitle:function(){return this._title;},setTitle:function(title){this._title=title;},getInstructions:function(){return this._instructions;},setInstructions:function(instructions){this._instructions=instructions;},getDOM:function(){var form=new jabberwerx.NodeBuilder("{jabber:x:data}x");if(this._type){form.attribute("type",this._type);}
  if(this._title){form.element("title").text(this._title);}
  if(this._instructions){form.element("instructions").text(this._instructions);}
  var that=this;jabberwerx.$.each(that.fields,function(){this.getDOM(form);});if(that.reported.length){var reported=form.element("reported");jabberwerx.$.each(that.reported,function(){this.getDOM(reported);});}
  if(that.items.length){var items=form.element("items");jabberwerx.$.each(that.items,function(){this.getDOM(items);});}
  return form.data;},addField:function(field){if(!field instanceof jabberwerx.XDataFormField){throw new TypeError("field must be type jabberwerx.XDataFormField");}
  var idx=this._indexOf(this.fields,field.getVar());if(idx!=-1){this.fields.splice(idx,1);}
  this.fields.push(field);},getFieldByVar:function(name){if(!name){return null;}
  var idx=this._indexOf(this.fields,name);if(idx!=-1){return this.fields[idx];}
  return null;},setFORM_TYPE:function(type){this.setFieldValue("FORM_TYPE",type,"hidden");},getFORM_TYPE:function(){return this.getFieldValue("FORM_TYPE");},submit:function(fieldsAndValues){var submitForm=new jabberwerx.XDataForm("submit");var property,field;var values;var idx;if(fieldsAndValues){var that=this;jabberwerx.$.each(fieldsAndValues,function(property){if(typeof property=="string"){values=[].concat(fieldsAndValues[property]);field=new jabberwerx.XDataFormField(property,values);idx=that._indexOf(that.fields,field.getVar());if(idx!=-1){field.setType(that.fields[idx].getType());field.setRequired(that.fields[idx].getRequired());}
  submitForm.addField(field);}});}
  for(var i=0;i<this.fields.length;i++){idx=this._indexOf(submitForm.fields,this.fields[i].getVar());if(idx==-1&&(this.fields[i].getValues().length||this.fields[i].getRequired())){if(this.fields[i].getType()=="fixed"||this.fields[i].getType()=="hidden")continue;field=new jabberwerx.XDataFormField(this.fields[i].getVar(),this.fields[i].getValues());field.setType(this.fields[i].getType());field.setRequired(this.fields[i].getRequired());submitForm.addField(field);}}
  submitForm.validate();return submitForm;},cancel:function(){var cancelForm=new jabberwerx.XDataForm("cancel");return cancelForm;},_indexOf:function(fields,name){if(!name){return-1;}
  for(var i=0;i<fields.length;i++){if(fields[i].getVar()==name){return i;}}
  return-1;},validate:function(){for(var i=0;i<this.fields.length;i++){var field=this.fields[i];field.validate();}
  this._validateReported();for(var i=0;i<this.items.length;i++){this._validateItem(this.items[i]);}},_validateReported:function(){for(var i=0;i<this.reported.length;i++){if(!this.reported[i].getVar()){throw new TypeError("reported should have var");}
  if(!this.reported[i].getType()){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("reported field should have type",{field:this.reported[i].getVar()});}
  if(!this.reported[i].getLabel()){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("reported field should have label",{field:this.reported[i].getVar()});}
  if(this.reported[i].getValues().length>0){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("reported field should not have values",{field:this.reported[i].getVar()});}
  this.reported[i].validate();}},_validateItem:function(item){var found;var fields=item.fields;for(var i=0;i<this.reported.length;i++){found=false;for(var j=0;j<fields.length||found;j++){if(fields[j].getVar()==this.reported[i].getVar()){found=true;fields[j].setType(this.reported[i].getType());fields[j].validate();}}
  if(!found){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("reported field is not found in one of the items",{field:this.reported[i].getVar()});}}},getFieldValue:function(name){var fld=this.getFieldByVar(name);if(fld){return fld.getValues()[0];}
  return null;},setFieldValue:function(name,value,type){if(!name){return;}
  var valid=(value!==undefined&&value!==null);var fld=this.getFieldByVar(name);if(!fld&&valid){fld=new jabberwerx.XDataFormField(name,value);fld.setType(type||"text-single");this.addField(fld);}else if(fld){if(valid){fld.setValues(value);}else{var idx=this._indexOf(this.fields,name);this.fields.splice(idx,1);}}},_type:null,_title:null,_instructions:null,fields:[],reported:[],items:[]},"jabberwerx.XDataForm");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/XDataFormField.js*/
;(function(jabberwerx){jabberwerx.XDataFormField=jabberwerx.JWModel.extend({init:function(varName,values,fieldNode){this._super();if(fieldNode){if(jabberwerx.isElement(fieldNode)){var that=this;fieldNode=jabberwerx.$(fieldNode);this._var=fieldNode.attr("var");this._type=fieldNode.attr("type");this._label=fieldNode.attr("label");this._values=[];var values=fieldNode.children("value");jabberwerx.$.each(values,function(){that._values.push(jabberwerx.$(this).text());});this._desc=fieldNode.children("desc").text();this._required=fieldNode.children("required")[0]?true:false;this._options=[];var options=fieldNode.children("option");jabberwerx.$.each(options,function(){that._options.push({label:jabberwerx.$(this).attr("label"),value:jabberwerx.$(this).children("value").text()});});}
else{throw new TypeError("fieldNode must be an Element");}}
else{if(!varName&&!values){throw new TypeError("one of the constructor parameters for XDataFormField should be not null");}
  if(varName){this._var=varName;}
  this.setValues(values);}},destroy:function(){this._super();},getVar:function(){return this._var;},setVar:function(var_name){this._var=var_name;},getType:function(){return this._type;},setType:function(type){this._type=type;},getLabel:function(){return this._label;},setLabel:function(label){this._label=label;},getValues:function(){var values=[].concat(this._values);return values;},setValues:function(values){this._values=[];if(values){if(typeof values=='string'||typeof values=='boolean'){this._values.push(values);}else if(values instanceof Array){for(var i=0;i<values.length;i++){this._values.push(values[i]);}}else{throw new TypeError("values must be string, number or array");}}},getDesc:function(){return this._desc;},setDesc:function(desc){this._desc=desc;},getOptions:function(){var options=[].concat(this._options);return options;},setOptions:function(options){this._options=[];var that=this;jabberwerx.$.each(options,function(){if(this.label&&this.value){that._options.push({label:this.label,value:this.value});}});},getRequired:function(){return this._required;},setRequired:function(required){this._required=required;},getDOM:function(form){var field=form.element("field");if(this._var){field.attribute("var",this._var);}
  if(this._type){field.attribute("type",this._type);}
  if(this._label){field.attribute("label",this.label);}
  for(var i=0;i<this._values.length;i++){field.element("value").text(this._values[i]);}
  if(this._required){field.element("required");}
  if(this._desc){field.element("desc").text(this._desc);}
  var that=this;jabberwerx.$.each(this._options,function(){field.element("option").attribute("label",this.label).text(this.value);});},equals:function(field){if(field===this){return true;}
  if(!field){return false;}
  if(this.getVar()!=field.getVar()){return false;}
  if(this.getType()!=field.getType()){return false;}
  if(this.getLabel()!=field.getLabel()){return false;}
  if(this.getDesc()!=field.getDesc()){return false;}
  var values=field.getValues();for(var idx=0;idx<this._values.length;idx++){if(typeof this._values[idx]=='function'){continue;}
    if(this._values[idx]!=values[idx]){return false;}}
  var options=field.getOptions();for(var idx=0;idx<this._options.length;idx++){if(typeof this._options[idx]=='function'){continue;}
    if(this._options[idx].label!=options[idx].label||this._options[idx].value!=options[idx].value){return false;}}
  return true;},validate:function(){if(this._type){if(this._type!="boolean"&&this._type!="fixed"&&this._type!="hidden"&&this._type!="jid-multi"&&this._type!="jid-single"&&this._type!="list-multi"&&this._type!="list-single"&&this._type!="text-multi"&&this._type!="text-private"&&this._type!="text-single"){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("field type should comply with XEP-0004",{field:this._var});}}
  if(this._type!="list-multi"&&this._type!="text-multi"&&this._type!="jid-multi"){if(this._values.length>1){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("field is not allowed to have multiple values",{field:this._var});}}
  if(this._required&&this._values.length==0){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("field is required to have a value",{field:this._var});}
  if(this._type=="boolean"&&this._values.length>0){if(this._values[0]=="true"||this._values[0]==true){this._values[0]="1";}
    if(this._values[0]=="false"||this._values[0]==false){this._values[0]="0";}
    if(this._values[0]!="0"&&this._values[0]!="1"){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("field of type boolean contains invalid value",{field:this._var});}}
  if(this._type=="jid-multi"||this._type=="jid-single"){var jid;for(var i=0;i<this._values.length;i++){try{jid=jabberwerx.JID.asJID(this._values[i]);}
  catch(e){throw new jabberwerx.XDataFormField.InvalidXDataFieldError("field of type jid contains invalid jid type",{field:this._var});}}
    if(this._type=='jid-multi'){jabberwerx.unique(this._values)}}},_type:null,_label:null,_var:null,_values:[],_desc:null,_required:false,_options:[]},"jabberwerx.XDataFormField");jabberwerx.XDataFormField.InvalidXDataFieldError=jabberwerx.util.Error.extend.call(TypeError);})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/XDataFormItem.js*/
;(function(jabberwerx){jabberwerx.XDataFormItem=jabberwerx.JWModel.extend({init:function(itemNode){this._super();this._DOM=itemNode;if(itemNode){if(jabberwerx.isElement(itemNode)){var that=this;var fieldNodes=jabberwerx.$(itemNode).children("field");var field;jabberwerx.$.each(fieldNodes,function(){field=new jabberwerx.XDataFormField(null,null,this);that.fields.push(field);});}
else{throw new TypeError("itemNode must be an Element");}}},destroy:function(){this._super();},getDOM:function(){return _DOM;},equals:function(item){if(item===this){return true;}
  if(!item){return false;}
  if(item.fields.length!=this.fields.length){return false;}
  for(var idx=0;idx<this.fields.length;idx++){if(!this.fields[idx].equals(item.fields[idx])){return false;}}
  return true;},getFieldByVar:function(name){if(!name){return null;}
  var idx=this._indexOf(this.fields,name);if(idx!=-1){return this.fields[idx];}
  return null;},getFieldValues:function(name){var field=this.getFieldByVar(name);if(field){return field.getValues();}
  return null;},_indexOf:function(fields,name){if(!name){return-1;}
  for(var i=0;i<fields.length;i++){if(fields[i].getVar()==name){return i;}}
  return-1;},fields:[]},"jabberwerx.XDataFormItem");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/MUCInvite.js*/
;(function(jabberwerx){jabberwerx.MUCInvite=jabberwerx.JWModel.extend({init:function(stanza,room,invitor,reason,password){if(!stanza||!room){throw new TypeError("stanza and room parameters must be present");}
  this.setStanza(stanza);this.setRoom(room);this.setInvitor(invitor);this.setReason(reason);this.setPassword(password);},getStanza:function(){return this._stanza||null;},getRoom:function(){return this._room||null;},getInvitor:function(){return this._invitor||null;},getReason:function(){return this._reason||null;},getPassword:function(){return this._password||null;},setStanza:function(stanza){if(stanza){if(stanza instanceof jabberwerx.Stanza){this._stanza=stanza;}else{throw new TypeError("stanza must be type jabberwerx.Stanza");}}},setRoom:function(room){if(room){try{this._room=jabberwerx.JID.asJID(room);}catch(e){throw new TypeError("room must be type jabberwerx.JID or convertible to a jabberwerx.JID");}}},setInvitor:function(invitor){if(invitor){try{this._invitor=jabberwerx.JID.asJID(invitor);}catch(e){throw new TypeError("invitor must be type jabberwerx.JID or convertible to a jabberwerx.JID");}}},setReason:function(reason){if(reason){if(typeof reason=="string"||reason instanceof String){this._reason=reason;}else{throw new TypeError("reason must be a string");}}},setPassword:function(password){if(password){if(typeof password=="string"||password instanceof String){this._password=password;}else{throw new TypeError("password must be a string");}}}},"jabberwerx.MUCInvite");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/Controller.js*/
;(function(jabberwerx){jabberwerx.Controller=jabberwerx.JWModel.extend({init:function(client,name){this._super();if(!name||typeof name!='string'){throw new TypeError("name must be a non-empty string");}
  if(!(client instanceof jabberwerx.Client)){throw new TypeError("client must be a jabberwerx.Client");}
  this.client=client;this.name=name;var orig=client.controllers[name];if(orig){orig.destroy();}
  client.controllers[name]=this;},destroy:function(){if(this.client&&this.client.controllers&&this.client.controllers[this.name]){delete this.client.controllers[this.name];delete this.client;}
  this._super();},updateEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.Entity&&entity.controller===this)){throw new TypeError("invalid entity to update");}
  this.client.entitySet.event("entityUpdated").trigger(entity);return entity;},removeEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.Entity&&entity.controller===this)){throw new TypeError("invalid entity to delete");}
  entity.destroy();return entity;},cleanupEntity:function(entity){},client:null,name:''},'jabberwerx.Controller');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/RosterController.js*/
;(function(jabberwerx){jabberwerx.RosterController=jabberwerx.Controller.extend({init:function(client){this._super(client,"roster");this.applyEvent("errorEncountered");this.applyEvent("subscriptionReceived");this.applyEvent("unsubscriptionReceived");this.applyEvent("rosterFetched");var that=this;var policyKeys=["autoaccept","autoaccept_in_domain","autoremove"];var policyDefaults=jabberwerx._config.subscriptions;jabberwerx.$.each(policyKeys,function(){var key=this;if(policyDefaults!==undefined&&policyDefaults[key]!==undefined){that[key]=policyDefaults[key];}
  return true;});client.event("iqReceived").bindWhen("[type='set'] query[xmlns='jabber:iq:roster']",this.invocation("_handleRosterUpdate"));client.event("presenceReceived").bindWhen("[type='subscribe'], [type='subscribed'], [type='unsubscribe'], [type='unsubscribed']",this.invocation("_handleSubscription"));},destroy:function(){var client=this.client;client.event("iqReceived").unbind(this.invocation("_handleRosterUpdate"));client.event("presenceReceived").unbind(this.invocation("_handleSubscription"));this._super();},updateEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.RosterContact)){throw new TypeError("entity must be a contact");}
  this.updateContact(entity.jid);},removeEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.RosterContact)){throw new TypeError("entity must be a contact");}
  this.deleteContact(entity.jid);},startRendezvous:function(ctx){this._super(ctx);this.fetch();return true;},finishRendezvous:function(){this.client.entitySet.endBatch();this.event("rosterfetched").trigger();return this._super();},fetch:function(callback){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(callback!==undefined&&!jabberwerx.$.isFunction(callback)){throw new TypeError('The callback param must be a function');}
  var that=this;this.client.entitySet.startBatch();this.client.sendIq('get',null,"<query xmlns='jabber:iq:roster'/>",function(stanza){var error=that._checkError(stanza);if(error){that.event("errorEncountered").trigger({operation:"fetch",error:error});}
    var items=jabberwerx.$('item',stanza).map(function(){return this.xml;}).get();that._fetchedPendingItems=items;that._processFetchedItem();if(callback){callback.call(that,error);}},20);},_processFetchedItem:function(){if(!this.client){return;}
  var cache=this.client.entitySet;var count=0;do{var contact=this._fetchedPendingItems.shift();if(!contact){delete this._fetchPendingWorker;this.finishRendezvous();return;}
    try{contact=jabberwerx.util.unserializeXML(contact);}catch(ex){jabberwerx.util.debug.log("Could not parse contact XML: "+contact);throw ex;}
    var jid=jabberwerx.$(contact).attr("jid");var ent=cache.entity(jid);contact=new jabberwerx.RosterContact(contact,this,ent);if(ent){ent.destroy();}
    cache.register(contact);count++;}while(count<jabberwerx.RosterController.FETCH_ITEM_PROCESS_COUNT);this._fetchPendingWorker=jabberwerx.system.setTimeout(this.invocation("_processFetchedItem"),jabberwerx.RosterController.FETCH_ITEM_PROCESS_INTERVAL);},addContact:function(jid,nickname,groups,callback){this._updateContact(jid,nickname,groups,callback,true);},updateContact:function(jid,nickname,groups,callback){this._updateContact(jid,nickname,groups,callback,true);},_updateContact:function(jid,nickname,groups,callback,addContact){if(callback!==undefined&&!jabberwerx.$.isFunction(callback)){throw new TypeError('The callback param must be a function');}
  if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  var that=this;jid=jabberwerx.JID.asJID(jid).getBareJID();var entity=this.client.entitySet.entity(jid);if(entity&&((groups===null)||(groups===undefined))){groups=entity.getGroups();}else{if(typeof groups=='string'||groups instanceof String){groups=[groups.toString()];}
    if(!(groups instanceof Array)||!groups.length||(groups.length==1&&(groups[0]==""))){groups=(this.defaultGroup&&[this.defaultGroup.toString()])||[];}}
  var nick;if(nickname===null||nickname===undefined){nick=(entity&&entity.getDisplayName())||null;}else{nick=nickname.toString();}
  var builder=new jabberwerx.NodeBuilder('{jabber:iq:roster}query');var rosterItem=builder.element('item');rosterItem.attribute('jid',jid.toString());if(nick){rosterItem.attribute('name',nick);}
  for(var i=0;i<groups.length;i++){rosterItem.element('group').text(groups[i]);}
  if(callback){this.client.sendIq("set",null,builder.data,function(stanza){if(stanza){var err=that._checkError(stanza);callback.call(that,err);}});}else{this.client.sendIq("set",null,builder.data);}
  if(addContact||this.autoSubscription){this.subscribe(jid);}},subscribe:function(jid){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  jid=jabberwerx.JID.asJID(jid).getBareJID();var entity=this.client.entitySet.entity(jid);if(entity&&entity instanceof jabberwerx.RosterContact){if(entity.properties.subscription=="to"||entity.properties.subscription=="both"){return;}}
  this.client.sendStanza("presence","subscribe",jid);},unsubscribe:function(jid){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  jid=jabberwerx.JID.asJID(jid).getBareJID();this._clearAckAck(jid);var entity=this.client.entitySet.entity(jid);if(entity&&entity instanceof jabberwerx.RosterContact){if(entity.properties.subscription=="both"){this.client.sendStanza("presence","unsubscribe",jid);}else if(entity.properties.subscription=="to"||entity.properties.subscription=="none"){this.deleteContact(jid);}}},deleteContact:function(jid,callback){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(callback!==undefined&&!jabberwerx.$.isFunction(callback)){throw new TypeError('The callback param must be a function');}
  var that=this;var jid=new jabberwerx.JID.asJID(jid).getBareJID();var builder=new jabberwerx.NodeBuilder('{jabber:iq:roster}query');builder=builder.element('item');builder=builder.attribute('jid',jid.toString());builder=builder.attribute('subscription','remove');this.client.sendIq('set',null,builder.document.xml,function(stanza){var error=that._checkError(stanza);if(callback){callback.call(that,error);}});},eachContact:function(op){this.client.entitySet.each(op,jabberwerx.RosterContact);},acceptSubscription:function(contact,nickname,groups){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  contact=jabberwerx.JID.asJID(contact).getBareJID();this._clearAckAck(contact);this.client.sendStanza("presence","subscribed",contact);this.updateContact(contact,nickname,groups);},denySubscription:function(contact){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  contact=jabberwerx.JID.asJID(contact).getBareJID();this._clearAckAck(contact);this.client.sendStanza("presence","unsubscribed",contact);if(this.autoSubscription){var entity=this.client.entitySet.entity(contact);if(entity&&entity instanceof jabberwerx.RosterContact){this.deleteContact(contact);}}},willBeSerialized:function(){if(this._fetchedPendingWorker){jabberwerx.system.clearTimeout(this._fetchedPendingWorker);delete this._fetchedPendingWorker;}},graphUnserialized:function(){if(this._fetchedPendingItems&&this._fetchedPendingItems.length){this._processFetchedItem();}},_clearAckAck:function(jid){var entity=this.client.entitySet.entity(jabberwerx.JID.asJID(jid).getBareJID());if(entity){delete entity.properties.ackack;}},cleanupEntity:function(entity){if(this._fetchPendingWorker){this._fetchedPendingItems=[];jabberwerx.system.clearInterval(this._fetchPendingWorker);delete this._fetchPendingWorker;}
  if(entity instanceof jabberwerx.RosterContact){entity.destroy();}},_checkError:function(parentElement){var error=undefined;var child=jabberwerx.$(parentElement).children("error")[0];if(child&&child.nodeName=='error'){error=child;}
  return error;},_autoAccept:function(prs){var from=prs.getFromJID();this._clearAckAck(from);var entity=this.client.entitySet.entity(from);var handled=this.autoaccept==jabberwerx.RosterController.AUTOACCEPT_ALWAYS;if(!handled&&this.autoaccept_in_domain&&from.getDomain()==this.client.connectedUser.jid.getDomain()){handled=true;}
  if(!handled&&this.autoaccept==jabberwerx.RosterController.AUTOACCEPT_IN_ROSTER&&entity){var props=entity.properties;handled=props["subscription"]=="to"||props["subscription"]=="none"||props["ask"]=="subscribe";}
  if(handled){this.acceptSubscription(from);}
  return handled;},_autoRemove:function(prs){var from=prs.getFromJID();this._clearAckAck(from);this.client.sendStanza("presence","unsubscribed",from);var entity=this.client.entitySet.entity(from.getBareJID());var handled=(this.autoSubscription&&this.autoremove)||entity.properties.subscription=="from"||entity.properties.subscription=="none";if(handled){this.deleteContact(from);}
  return handled;},_handleSubscription:function(evt){var prs=evt.data;switch(prs.getType()){case"subscribe":var handled=this._autoAccept(prs);this.event("subscriptionReceived").trigger({stanza:prs,handled:handled});break;case"subscribed":var e=this.client.entitySet.entity(prs.getFromJID().getBareJID());if(!e||e.properties.ackack===undefined){this.client.sendStanza("presence","subscribe",prs.getFrom());if(e){e.properties.ackack=true;}}
  break;case"unsubscribe":var handled=this._autoRemove(prs);this.event("unsubscriptionReceived").trigger({stanza:prs,handled:handled});break;case"unsubscribed":this._clearAckAck(prs.getFromJID());this.client.sendStanza("presence","unsubscribe",prs.getFrom());break;}
  return true;},_handleRosterUpdate:function(evt){var node=jabberwerx.$(evt.selected);var item=node.children('item');var jid=item.attr('jid');var subscr=item.attr("subscription");var entity=this.client.entitySet.entity(jid);if(subscr!="remove"){item=item.get()[0];if(entity&&entity instanceof jabberwerx.RosterContact){entity.setItemNode(item);}else{var contact=new jabberwerx.RosterContact(item,this,entity);if(entity){entity.destroy();}
  this.client.entitySet.register(contact);}}else if(entity&&entity instanceof jabberwerx.RosterContact){delete entity.properties.subscription;delete entity.properties.ask;entity.destroy();}
  return true;},_fetchedPendingItems:[],autoSubscription:true,autoaccept:'in-roster',autoaccept_in_domain:true,autoremove:true,defaultGroup:""},'jabberwerx.RosterController');jabberwerx.RosterController.FETCH_ITEM_PROCESS_INTERVAL=5;jabberwerx.RosterController.FETCH_ITEM_PROCESS_COUNT=1;jabberwerx.RosterController.AUTOACCEPT_NEVER="never";jabberwerx.RosterController.AUTOACCEPT_IN_ROSTER="in-roster";jabberwerx.RosterController.AUTOACCEPT_ALWAYS="always";jabberwerx.RosterController.mixin(jabberwerx.Rendezvousable);})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/CapabilitiesController.js*/
;(function(jabberwerx){jabberwerx.CapabilitiesController=jabberwerx.Controller.extend({init:function(client){this._super(client,"capabilities");this.client.event('beforePresenceSent').bind(this.invocation('_beforePresenceHandler'));this.client.event('presenceSent').bind(this.invocation('_resendCaps'));this.client.event('iqReceived').bindWhen("*[type='get'] query[xmlns='http://jabber.org/protocol/disco#info']",this.invocation('_discoInfoHandler'));jabberwerx.globalEvents.bind("resourcePresenceChanged",this.invocation("_handleResourcePresenceUpdate"));this.addFeature('http://jabber.org/protocol/caps');this.addFeature('http://jabber.org/protocol/disco#info');},destroy:function(){this.client.event('beforePresenceSent').unbind(this.invocation('_beforePresenceHandler'));this.client.event('presenceSent').unbind(this.invocation('_resendCaps'));this.client.event('iqReceived').unbind(this.invocation('_discoInfoHandler'));jabberwerx.globalEvents.unbind("resourcePresenceChanged",this.invocation("_handleResourcePresenceUpdate"));this._super();},_updatePresence:function(jid){if((this.client.isConnected())&&(this.client.getCurrentPresence()!=null)){var p=this.client.getCurrentPresence().clone();jabberwerx.$(p.getNode()).find("c[xmlns='http://jabber.org/protocol/caps']").remove();if(jid){p.setTo(jid);}
  this.client.sendStanza(p);}},addFeature:function(feature){var retVal=false;if(typeof feature=='string'){if(!this.containsFeature(feature)){this._featureSet.push(feature);this._featureSet.sort();retVal=true;}}
  if(retVal){this._updatePresence();}
  return retVal;},removeFeature:function(feature){var retVal=false;if(typeof feature=='string'||feature instanceof String){var index=jabberwerx.$.inArray(feature,this._featureSet);if(index>=0){this._featureSet.splice(index,1);retVal=true;}}
  if(retVal){this._updatePresence();}
  return retVal;},addFeatureToJid:function(jid,feature){if(!(feature&&typeof feature=='string')){throw new TypeError("feature must be non empty string");}
  var validatedJid=jabberwerx.JID.asJID(jid).getBareJID();if(!this._featureSetPerJid[validatedJid]){this._featureSetPerJid[validatedJid]=new jabberwerx.CapabilitiesController.JidFeatureSet(this);}
  var retVal=this._featureSetPerJid[validatedJid].addFeature(feature);if(retVal){this._updatePresence(jid);}
  return retVal;},containsFeatureForJid:function(jid,feature){if(!(feature&&typeof feature=='string')){throw new TypeError("feature must be non empty string");}
  var validatedJid=jabberwerx.JID.asJID(jid).getBareJID();if(this._featureSetPerJid[validatedJid]){return this._featureSetPerJid[validatedJid].containsFeature(feature);}
  else{return false;}},removeFeatureFromJid:function(jid,feature){var retVal=false;if(!(feature&&typeof feature=='string')){throw new TypeError("feature must be non empty string");}
  var validatedJid=jabberwerx.JID.asJID(jid).getBareJID();if(this._featureSetPerJid[validatedJid]){retVal=this._featureSetPerJid[validatedJid].removeFeature(feature);if(this._featureSetPerJid[validatedJid].extraFeatures.length==0){delete this._featureSetPerJid[validatedJid];}}
  if(retVal){this._updatePresence(jid);}
  return retVal;},_resendCaps:function(eventObj){var presence=eventObj.data;if(!(presence.getTo()||presence.getType()||presence.getShow()=='unavailable')){for(var jid in this._featureSetPerJid){var p=presence.clone();jabberwerx.$(p.getNode()).find("c[xmlns='http://jabber.org/protocol/caps']").remove();p.setTo(jid);this.client.sendStanza(p);}}},attachCapabilitiesToPresence:function(presence){if(!(presence&&presence instanceof jabberwerx.Presence)){throw new TypeError("presence must be a jabberwerx.Presence");}
  var builder=jabberwerx.$(presence.getNode()).find("c[xmlns='http://jabber.org/protocol/caps']").map(function(){return new jabberwerx.NodeBuilder(this);})[0];var ver_attr=jabberwerx.$(presence.getNode()).find("c[ver]").map(function(){return new jabberwerx.NodeBuilder(this);})[0];if(!ver_attr){var ver=null;if(!builder){builder=new jabberwerx.NodeBuilder(presence.getNode()).element("{http://jabber.org/protocol/caps}c");}
    if(presence.getTo()){var jid=presence.getToJID();ver=this.getVerificationStringForJid(jid);}
    if(!ver){ver=this.generateVerificationString();}
    builder.attribute("hash","sha-1");builder.attribute("node",this.node);builder.attribute("ver",ver);}},getVerificationStringForJid:function(jid){var ver=null;var validatedJid=jabberwerx.JID.asJID(jid).getBareJID();if(this._featureSetPerJid[validatedJid]){ver=this._featureSetPerJid[validatedJid].ver;}
  return ver;},getVerificationString:function(nodeVal){var ver=null;if(nodeVal==this.node+'#'+this.generateVerificationString()){ver=this.generateVerificationString();}else{for(var jid in this._featureSetPerJid){if(nodeVal==this.node+'#'+this._featureSetPerJid[jid].ver){ver=this._featureSetPerJid[jid].ver;break;}}}
  return ver;},getFeaturesForVerificationString:function(ver){var features=[];if(!(ver&&typeof ver=='string')){throw new TypeError("version must be non empty string");}
  if(ver==this.generateVerificationString()){features=this.getFeatureSet();}else{for(var jid in this._featureSetPerJid){if(ver==this._featureSetPerJid[jid].ver){features=jabberwerx.unique(this.getFeatureSet().concat(this._featureSetPerJid[jid].extraFeatures));features.sort();}}}
  return features;},getFeatureSet:function(){return this._featureSet;},containsFeature:function(feature){var retVal=false;for(var i=0;i<this._featureSet.length;i++){if(this._featureSet[i]==feature){retVal=true;break;}}
  return retVal;},generateVerificationString:function(features){var feats=(features?jabberwerx.unique(this._featureSet.concat(features)):this._featureSet);return jabberwerx.CapabilitiesController._generateVerificationString([this._getIdentity()],feats,[]);},_getIdentity:function(){return(this.identity.category?this.identity.category:'')+'/'+
  (this.identity.type?this.identity.type:'')+'//'+
  (this.identity.name?this.identity.name:'');},_beforePresenceHandler:function(eventObj){var presence=eventObj.data;if(!(presence.getType()||presence.getShow()=='unavailable')){this.attachCapabilitiesToPresence(presence);}
  return false;},_discoInfoHandler:function(eventObj){jabberwerx.util.debug.log("received disco#info request...");var iq=eventObj.data;var iqResult=this._createDiscoInfoResponse(iq);this.client.sendStanza(iqResult);return true;},_createDiscoInfoResponse:function(iq){var iqResult=null;var nodeValue=jabberwerx.$(iq.getQuery()).attr('node');var ver=null;if(nodeValue){ver=this.getVerificationString(nodeValue);}
  if(!nodeValue||ver){var builder=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/disco#info}query");if(ver){builder.attribute('node',this.node+'#'+ver);}
    var identity={"category":this.identity.category,"type":this.identity.type};if(this.identity.name){identity.name=this.identity.name;}
    builder.element('identity',identity);var features=null;if(!nodeValue){features=this._featureSet;}else{features=this.getFeaturesForVerificationString(ver);}
    jabberwerx.$.each(features,function(){builder.element('feature',{"var":this});return true;});iqResult=iq.reply(builder.data);}else{iqResult=iq.errorReply(jabberwerx.Stanza.ERR_ITEM_NOT_FOUND);}
  return iqResult;},_findCapsInfo:function(jid){var result=[];for(var ver in this._capsCache){var ci=this._capsCache[ver];if(ci.getReferences(jid).length>0){result.push(ci);}}
  return result;},_firstCapsInfo:function(jid){var ret=this._findCapsInfo(jid);if(ret.length>0){return ret[0];}
  return null;},isSupportedFeature:function(jid,feature){if(!jabberwerx.util.isString(feature)){throw new TypeError("Feature must be a non empty string");}
  jid=jabberwerx.JID.asJID(jid);var caps=this._findCapsInfo(jid);for(var i=0;i<caps.length;++i){if(jabberwerx.$.inArray(feature,caps[i].features)!=-1){return true;}}
  return false;},getSupportedResources:function(jid,feature){if(!jabberwerx.util.isString(feature)||feature==""){throw new TypeError("Feature must be a non empty string");}
  jid=jabberwerx.JID.asJID(jid).getBareJID();var caps=this._findCapsInfo(jid);var resmap={};for(var j=0;j<caps.length;++j){var ci=caps[j];if(jabberwerx.$.inArray(feature,ci.features)!=-1){var refs=ci.getReferences(jid);for(var i=0;i<refs.length;++i){resmap[refs[i].toString()]=refs[i];}}}
  var result=[];jabberwerx.$.each(resmap,function(idx,jidstr){result.push(resmap[idx]);});return result;},getFeatures:function(jid){jid=jabberwerx.JID.asJID(jid);var result=[];var caps=this._findCapsInfo(jid);for(var i=0;i<caps.length;++i){result=result.concat(caps[i].features);}
  return jabberwerx.unique(result);},getIdentities:function(jid){jid=jabberwerx.JID.asJID(jid);var ids=[];var caps=this._findCapsInfo(jid);for(var i=0;i<caps.length;++i){ids=ids.concat(caps[i].identities);}
  return jabberwerx.$.map(jabberwerx.unique(ids),function(id,idx){var idParts=id.split("/");return{category:idParts[0],type:idParts[1],xmlLang:idParts[2],name:idParts[3]};});},_newCapsInfo:function(jid,ver,node){var ci=new jabberwerx.CapabilitiesController.CapsInfo(this,node,ver);ci.addReference(jid);this._capsCache[ver]=ci;this.client.controllers.disco.fetchInfo(jid,ci.id,function(identities,features,forms,err){if(err){ci.validate();}else{ci._populate(identities,features,forms);}
  ci._capsController._updateRefs(ci.ver);});},_updateRefs:function(ver){var ujids=[];var ci=this._capsCache[ver];for(var i=0;i<ci.items.length;++i){var bstr=jabberwerx.JID.asJID(ci.items[i]).getBareJIDString();if(jabberwerx.$.inArray(bstr,ujids)==-1){ujids.push(bstr);}}
  for(var i=0;i<ujids.length;++i){var entity=this.client.entitySet.entity(ujids[i]);if(entity){this.client.entitySet.event("entityUpdated").trigger(entity);}}},_clearRefs:function(){for(var ver in this._capsCache){this._capsCache[ver].clearReferences();}},_removeInvalid:function(){for(var ver in this._capsCache){var ci=this._capsCache[ver];if(ci.status!="valid"){delete this._capsCache[ver];}}},_handleResourcePresenceUpdate:function(evt){if(!this._handle115Receiving){return false;}
  if(!this.client.connectedUser){return false;}
  var _myjid=jabberwerx.JID.asJID(this.client.connectedUser.jid+'/'+this.client.resourceName);var presence=evt.data.presence;var ce=presence?jabberwerx.$(presence.getNode()).find("c[xmlns='http://jabber.org/protocol/caps']"):null;if(!ce||ce.length==0){return false;}
  var jid=evt.data.fullJid;var ver=ce.attr("ver");var node=ce.attr("node");if(jid.equals(_myjid)&&!this._capsCache[ver]){var ci=new jabberwerx.CapabilitiesController.CapsInfo(this,node,ver);ci._populate(this._getIdentity(),this._featureSet,[]);ci.addReference(_myjid);this._capsCache[ver]=ci;return false;}
  var entity=this.client.entitySet.entity(jid.getBareJID());if(!entity){return false;}
  var oldci=this._firstCapsInfo(jid);if(presence&&presence.getType()!='unavailable'){ci=this._capsCache[ver];if(oldci&&(oldci===ci)){return false;}else if(oldci){oldci.removeReference(jid);}
    if(ci){ci.addReference(jid);}else{this._newCapsInfo(jid,ver,node);return false;}}else if(oldci){oldci.removeReference(jid);}
  this.client.entitySet.event("entityUpdated").trigger(entity);return false;},identity:{category:'client',name:'Cisco AJAX XMPP Library',type:'pc',toString:function(){return(this.category?this.category:'')+'/'+
  (this.type?this.type:'')+'//'+
  (this.name?this.name:'');}},node:'http://jabber.cisco.com/caxl',_featureSet:['http://jabber.org/protocol/disco#info'],_featureSetPerJid:{},_capsCache:{},_handle115Receiving:true,_updateCaps:false},'jabberwerx.CapabilitiesController');jabberwerx.CapabilitiesController.JidFeatureSet=jabberwerx.JWModel.extend({init:function(capsController){this._super();this._capsController=capsController;},_capsController:{},extraFeatures:[],ver:null,addFeature:function(feature){var retVal=false;if(!(feature&&typeof feature=='string')){throw new TypeError("feature must be non empty string");}
  if(!this.containsFeature(feature)){this.extraFeatures.push(feature);this.extraFeatures.sort();this.ver=this._capsController.generateVerificationString(this.extraFeatures);retVal=true;}
  return retVal;},containsFeature:function(feature){var retVal=false;if(!(feature&&typeof feature=='string')){throw new TypeError("feature must be non empty string");}
  var index=jabberwerx.$.inArray(feature,this.extraFeatures);if(index>=0){retVal=true;}
  return retVal;},removeFeature:function(feature){var retVal=false;if(!(feature&&typeof feature=='string')){throw new TypeError("feature must be non empty string");}
  var index=jabberwerx.$.inArray(feature,this.extraFeatures);if(index>=0){this.extraFeatures.splice(index,1);this.ver=this._capsController.generateVerificationString(this.extraFeatures);retVal=true;}
  return retVal;}},"jabberwerx.CapabilitiesController.JidFeatureSet");jabberwerx.CapabilitiesController.CapsInfo=jabberwerx.JWModel.extend({init:function(capsController,node,ver){this._super();if(!capsController||!(capsController instanceof jabberwerx.CapabilitiesController)){throw new TypeError("CapsInfo must be created with a valid CapabilitiesController");}
  this._capsController=capsController;this._node=node;this.ver=(ver?ver:"");this._lockedVer=this.ver!="";this.id=this._node+"#"+this.ver;},validate:function(){this.status="invalid";this.id=this._node+'#'+this.ver;var deduped=[].concat(this.identities);jabberwerx.unique(deduped);if(deduped.length!=this.identities.length){return false;}
  for(var i=0;i<deduped.length;++i){var idparts=deduped[i].split("/");if((idparts.length!=4)||(!idparts[0]||!idparts[1])){return false;}}
  deduped=[].concat(this.features);jabberwerx.unique(deduped);if(deduped.length!=this.features.length){return false;}
  var reqNS=0;for(var i=0;i<deduped.length;++i){if(!deduped[i]){return false;}
    if((deduped[i]=="http://jabber.org/protocol/disco#info")||(deduped[i]=="http://jabber.org/protocol/caps")){reqNS++;}}
  if(reqNS!=2)
  {return false;}
  var uforms={};for(var i=0;i<this.forms.length;++i)
  {var oneform=this.forms[i];var ftfld=oneform.getFieldByVar("FORM_TYPE");if(!ftfld||(ftfld.getType()!="hidden")){continue;}
    deduped=[].concat(ftfld.getValues());jabberwerx.unique(deduped);if(deduped.length==0)
  {}
  else if(deduped.length!=1)
  {}
  else if(!deduped[0])
  {}else if(uforms[deduped[0]]){}else{uforms[deduped[0]]=oneform;continue;}
    return false;}
  var newVer=this._generateVerString();if(!this._lockedVer){this.ver=newVer;}
  if(newVer==this.ver){this.status="valid";this.id=this.ver;}
  return this.status=="valid";},_generateVerString:function(){return jabberwerx.CapabilitiesController._generateVerificationString(this.identities,this.features,this.forms);},_populate:function(identities,features,forms){this.identities=[];this.features=[];this.forms=[];this.status="invalid";this.id=this._node+'#'+this.ver;if(identities){this.identities=this.identities.concat(identities);}
  if(features){this.features=this.features.concat(features);}
  if(forms){this.forms=this.forms.concat(forms);}
  this.identities.sort();this.features.sort();return this.validate();},addReference:function(jid){if(this.indexOfReference(jid,true)==-1){this.items.push(jid.toString());}},removeReference:function(jid){var idx=this.indexOfReference(jid,true);if(idx!=-1){this.items.splice(idx,1);}},hasReference:function(jid){return this.indexOfReference(jid)!=-1;},indexOfReference:function(jid,exact){var tjid=jabberwerx.JID.asJID(jid);exact=exact||(tjid.getResource()!='');if(!exact){tjid=tjid.getBareJID();}
  for(var i=0;i<this.items.length;++i){var ijid=jabberwerx.JID.asJID(this.items[i]);if((exact&&tjid.equals(ijid))||(!exact&&tjid.equals(ijid.getBareJID()))){return i;}}
  return-1;},getReferences:function(jid){var result=[];var tjid=jabberwerx.JID.asJID(jid);var exact=tjid.getResource()!='';for(var i=0;i<this.items.length;++i){var ijid=jabberwerx.JID.asJID(this.items[i]);if(exact&&ijid.equals(tjid)){return[ijid];}
  if(!exact&&ijid.getBareJID().equals(tjid)){result.push(ijid);}}
  return result;},_clearReferences:function(){this.items=[];},_capsController:{},_node:'',ver:'',status:"invalid",identities:[],features:[],forms:[],items:[]},"jabberwerx.CapabilitiesController.CapsInfo");jabberwerx.CapabilitiesController._generateVerificationString=function(identities,features,forms,noEncode){var prepFactor=function(fact){return jabberwerx.util.crypto.utf8Encode(fact.replace(/</g,"&lt;"));}
  var __arrayToVerStr=function(arr){var vstrings=jabberwerx.$.map(arr,function(ele){return prepFactor(ele);});vstrings.sort();return vstrings.join('<')+'<';};var __formsToVerStr=function(forms){var formStrs=jabberwerx.$.map(forms,function(form){var ftfld=form.getFieldByVar("FORM_TYPE");if(!ftfld||(ftfld.getType()!="hidden")){return null;}
    var fieldStrs=jabberwerx.$.map(form.fields,function(field){var fstr=field.getVar();if(fstr=="FORM_TYPE"){return null;}
      var valueStrs=jabberwerx.$.map(field.getValues(),function(val){return prepFactor(val);});valueStrs.sort();return prepFactor(fstr)+"<"+valueStrs.join("<");});fieldStrs.sort();return prepFactor(form.getFORM_TYPE())+"<"+fieldStrs.join("<")+"<";});formStrs.sort();return formStrs.join("");};var baseStr=""
  if(identities&&identities.length>0){baseStr+=__arrayToVerStr(identities);}
  if(features&&features.length>0){baseStr+=__arrayToVerStr(features);}
  if(forms&&forms.length>0){baseStr+=__formsToVerStr(forms);}
  if(!noEncode){baseStr=jabberwerx.util.crypto.b64_sha1(baseStr);}
  return baseStr;}
  jabberwerx.Client.intercept({init:function(){this._super.apply(this,arguments);var capController=new jabberwerx.CapabilitiesController(this);if(jabberwerx._config.capabilityFeatures){for(var i=0;i<jabberwerx._config.capabilityFeatures.length;i++){capController.addFeature(jabberwerx._config.capabilityFeatures[i]);}}
    if(jabberwerx._config.capabilityIdentity){capController.identity.category=jabberwerx._config.capabilityIdentity.category;capController.identity.type=jabberwerx._config.capabilityIdentity.type;capController.identity.name=jabberwerx._config.capabilityIdentity.name;capController.node=jabberwerx._config.capabilityIdentity.node;}},_connected:function(){this._super.apply(this,arguments);if(!this.getCurrentPresence()){this.sendPresence();}}});})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/ChatController.js*/
;(function(jabberwerx){jabberwerx.ChatController=jabberwerx.Controller.extend({init:function(client){this._super(client,'chat');var caps=client.controllers.capabilities||new jabberwerx.CapabilitiesController(client);caps.addFeature('http://jabber.org/protocol/chatstates');caps.addFeature('http://jabber.org/protocol/xhtml-im');this.applyEvent('chatSessionOpened');this.applyEvent('chatSessionClosed');this.client.event('afterMessageReceived').bindWhen('message[type!="groupchat"]'+'[type!="error"] body',this.invocation('_messageHandler'));},openSession:function(jid,thread){var chatSession=null;jid=jabberwerx.JID.asJID(jid);chatSession=this.getSession(jid);if(!chatSession){chatSession=new jabberwerx.ChatSession(this.client,jid,thread);this._chatSessions.push(chatSession);this.event('chatSessionOpened').trigger({chatSession:chatSession,userCreated:true});}
  return chatSession;},closeSession:function(session){var index=this._getChatSessionIndex(session);if(index>=0){var closedChatSession=this._chatSessions[index];this._chatSessions.splice(index,1);this.event('chatSessionClosed').trigger(closedChatSession);closedChatSession.destroy();delete closedChatSession;return true;}
  return false;},getSession:function(jid){var index=this._getChatSessionIndex(jid);return(index>=0)?this._chatSessions[index]:null;},_messageHandler:function(eventObj){var msg=eventObj.data;var from=msg.getFromJID();if(this._getChatSessionIndex(from)<0){var chatSession=new jabberwerx.ChatSession(this.client,from,msg.getThread());this._chatSessions.push(chatSession);this.event('chatSessionOpened').trigger({chatSession:chatSession,userCreated:false});chatSession._chatReceivedHandler(eventObj);return true;}
  return false;},_getChatSessionIndex:function(session){var index=-1;var jid;if(session instanceof jabberwerx.ChatSession){jid=session.jid;}else{try{jid=jabberwerx.JID.asJID(session);}catch(e){return index;}}
  if(!jid){return index;}
  var privateMessage=this.isPrivateMessage(jid);var jidStr=(privateMessage)?jid.toString():jid.getBareJIDString();for(var i=0;i<this._chatSessions.length;i++){var chatJidStr=(privateMessage)?this._chatSessions[i].jid.toString():this._chatSessions[i].jid.getBareJIDString();if(chatJidStr==jidStr){index=i;break;}}
  return index;},isPrivateMessage:function(jid){if(!(jid instanceof jabberwerx.JID)){throw new TypeError("jid must be of type jabberwerx.JID");}
  var mucJid=jid.getBareJID();var entity=this.client.entitySet.entity(mucJid);return(entity&&entity instanceof jabberwerx.MUCRoom);},sendChatStates:true,_chatSessions:[]},'jabberwerx.ChatController');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/MUCController.js*/
;(function(jabberwerx){jabberwerx.MUCController=jabberwerx.Controller.extend({init:function(client){this._super(client,"muc");this.INVITE_SELECTOR="message[type!='error']>x[xmlns='"+this.MUC_USER_NS+"']>invite";var caps=client.controllers.capabilities||jabberwerx.CapabilitiesController(client);caps.addFeature('http://jabber.org/protocol/muc');caps.addFeature(this.MUC_USER_NS);caps.addFeature('jabber:x:conference');caps.addFeature('http://jabber.org/protocol/xhtml-im');this.applyEvent('mucInviteReceived');this.client.event("messageReceived").bindWhen("message[type!='error']>x[xmlns='jabber:x:conference']",this.invocation("_handleDirectInvite"));this.client.event("messageReceived").bindWhen(this.INVITE_SELECTOR,this.invocation("_handleMediatedInvite"));},destroy:function(){this._super();},updateEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.MUCRoom)){throw new TypeError("entity must be a MUCRoom");}
  this.client.entitySet.event("entityUpdated").trigger(entity);},removeEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.MUCRoom)){throw new TypeError("entity must be a MUCRoom");}
  if(entity.isActive()&&this.client.isConnected()){entity.event("roomExited").bind(function(evt){entity.event("roomExited").unbind(arguments.callee);entity.destroy();});entity.exit();}else{entity.destroy();}},room:function(jid){jid=jabberwerx.JID.asJID(jid).getBareJID();var room=this.client.entitySet.entity(jid);if(!(room&&room instanceof jabberwerx.MUCRoom)){var ent=room;room=new jabberwerx.MUCRoom(jid,this);if(ent){room.apply(ent);ent.remove();}
  this.client.entitySet.register(room);}
  return room;},cleanupEntity:function(entity){if(entity instanceof jabberwerx.MUCRoom){entity.remove();}},_handleDirectInvite:function(evtObj){var msg=evtObj.data;if(jabberwerx.$(this.INVITE_SELECTOR,msg.getDoc()).length==0){var invitor=msg.getFromJID();var x=jabberwerx.$(evtObj.selected);var room=x.attr("jid");var reason=x.attr("reason");this._handleInvite(msg,room,invitor,reason);return true;}
  return false;},_handleMediatedInvite:function(evtObj){var msg=evtObj.data;var invite=evtObj.selected;var invitor=jabberwerx.$(invite).attr("from");var room=msg.getFromJID();var reason=jabberwerx.$("reason",invite).text()||null;var password=jabberwerx.$("password",evtObj.data.getDoc()).text()||null;this._handleInvite(msg,room,invitor,reason,password);return true;},_handleInvite:function(stanza,room,invitor,reason,password){var mucInvite=new jabberwerx.MUCInvite(stanza,room,invitor,reason,password);var ent=this.client.entitySet.entity(mucInvite.getRoom());if(!(ent&&ent instanceof jabberwerx.MUCRoom&&ent.isActive())){this.event('mucInviteReceived').trigger(mucInvite);}},_sendSearchIq:function(muc,callback,form){var queryString="{jabber:iq:search}query";var query=new jabberwerx.NodeBuilder(queryString);var type="get";if(form){if(this.escapeSearch){try{var roomName=jabberwerx.$.trim(form.getFieldValue("room-name"));form.setFieldValue("room-name",jabberwerx.JID.escapeNode(roomName));}catch(e){callback(null,e);return;}}
  query.node(form.getDOM());type="set";}
  this.client.sendIQ(type,muc,query.data,function(stanza){var iq=new jabberwerx.IQ(stanza);if(iq.isError()){callback(null,iq.getErrorInfo());}else{var form=jabberwerx.$("x",iq.getNode()).get(0);if(!form){callback(null,jabberwerx.Stanza.ERR_SERVICE_UNAVAILABLE);}else{callback(new jabberwerx.XDataForm(null,form));}}});},startSearch:function(muc,callback){muc=jabberwerx.JID.asJID(muc).getDomain();if(!jabberwerx.$.isFunction(callback)){throw new TypeError("The variable 'callback' must be a function.");}
  this._sendSearchIq(muc,callback);},submitSearch:function(muc,form,callback){muc=jabberwerx.JID.asJID(muc).getDomain();if(!jabberwerx.$.isFunction(callback)){throw new TypeError("The variable 'callback' must be a function.");}
  if(!(form&&form instanceof jabberwerx.XDataForm)){throw new TypeError("form must be an XDataForm");}
  this._sendSearchIq(muc,callback,form);},MUC_USER_NS:"http://jabber.org/protocol/muc#user",INVITE_SELECTOR:"",escapeSearch:true},"jabberwerx.MUCController");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/PrivacyListController.js*/
;(function(jabberwerx){jabberwerx.PrivacyListController=jabberwerx.Controller.extend({init:function(client){this._super(client,"privacyList");this.applyEvent("errorEncountered");this.applyEvent("privacyListApplied");this.applyEvent("privacyListUpdated");this.applyEvent("privacyListRemoved");this.client.event('afterIqReceived').bindWhen("[type='set'] query[xmlns='jabber:iq:privacy'] list",this.invocation('_handlePrivacyListUpdate'));},destroy:function(){this.client.event('afterIqReceived').unbind(this.invocation('_handlePrivacyListUpdate'));this._super();},fetch:function(list,callback){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(callback!==undefined&&!jabberwerx.$.isFunction(callback)){throw new TypeError('The callback param must be a function');}
  if(!list||typeof list!='string'){throw new TypeError('Privacy list name should be non empty string.');}
  this._doFetch(list,true,callback);},_doFetch:function(list,create,callback){var that=this;var errorOccured=false;var removed=false;this.client.sendIq('get',null,"<query xmlns='jabber:iq:privacy'><list name='"+list+"'/></query>",function(stanza){var error=that._checkError(stanza);var prvListNode=jabberwerx.$(stanza).find("list").get(0);var list_name=prvListNode.getAttribute("name");var privListObj=that._privacyLists[list_name];if(error){var item_not_found=jabberwerx.$(error).find("item-not-found").get(0);if(item_not_found){if(!create){if(that._privacyLists[list_name]){that.event("privacyListRemoved").trigger(that._privacyLists[list_name]);that._privacyLists[list_name].destroy();removed=true;}}else{error=null;}}
else{errorOccured=true;}}
  if(errorOccured){that.event("errorEncountered").trigger({operation:"fetch",error:error,target:that._privacyLists[list_name]});}else{if(!removed){if(that._privacyLists[list_name]){that._privacyLists[list_name]._update(prvListNode);}else{privListObj=that._privacyLists[list_name]=new jabberwerx.PrivacyList(prvListNode,that);}
    that.event("privacyListUpdated").trigger(that._privacyLists[list_name]);}}
  if(callback){callback.call(that,privListObj,error);}});},_remove:function(list){if(this._privacyLists[list]){delete this._privacyLists[list];}},_checkError:function(parentElement){return jabberwerx.$(parentElement).children("error")[0];},apply:function(list,callback){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(callback!==undefined&&!jabberwerx.$.isFunction(callback)){throw new TypeError('The callback param must be a function');}
  var list_name;if(list){if(typeof list=='string'){list_name=list;}else if(list instanceof jabberwerx.PrivacyList){list_name=list.getName();}else{throw new TypeError('Privacy list name should be string or PrivacyList or empty.');}}
  var queryNode=new jabberwerx.NodeBuilder("{jabber:iq:privacy}query").attribute("type","set");var activeNode=queryNode.element("active");if(list){activeNode.attribute("name",list_name);}
  var that=this;this.client.sendIq('set',null,queryNode.data,function(stanza){var error=that._checkError(stanza);if(error){that.event("errorEncountered").trigger({operation:"apply",error:error});}else{that.event("privacyListApplied").trigger({list:list_name});}
    if(callback){callback.call(that,error);}});},_handlePrivacyListUpdate:function(evt){var list_name=jabberwerx.$(evt.selected).attr("name")
  var iq=new jabberwerx.IQ();iq.setTo(evt.data.getFrom());iq.setFrom();iq.setType("result");iq.setID(evt.data.getID());this.client.sendStanza(iq);this._doFetch(list_name);return true;},_privacyLists:{}},'jabberwerx.PrivacyListController');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/PrivateStorageController.js*/
;(function(jabberwerx){jabberwerx.PrivateStorageController=jabberwerx.Controller.extend({init:function(client){this._super(client,"privateStorage");},destroy:function(){this._super();},fetch:function(ename,callback){if(!this.client.isConnected()){throw new jabberwerx.Client.NotConnectedError();}
  if(!jabberwerx.$.isFunction(callback)){throw new TypeError('The callback param must be a function');}
  if(!ename){throw new TypeError('Private storage element name should not be empty.');}
  var query=new jabberwerx.NodeBuilder("{jabber:iq:private}query");var prv_elem=query.element(ename);var that=this;this.client.sendIq("get",null,query.data,function(stanza){var error=that._checkError(stanza);var private_data=jabberwerx.$(stanza).find(prv_elem.data.tagName+"[xmlns='"+prv_elem.data.getAttribute("xmlns")+"']").get(0);if(callback){callback.call(that,private_data,error);}});},update:function(private_elm){if(!jabberwerx.isElement(private_elm)){throw new TypeError('Private storage should be an element.');}
  var query=new jabberwerx.NodeBuilder("{jabber:iq:private}query").node(private_elm).parent;this.client.sendIq("set",null,query.data);},remove:function(ename){if(!ename){throw new TypeError('Private storage element name should not be empty.');}
  var query=new jabberwerx.NodeBuilder("{jabber:iq:private}query").element(ename).parent;this.client.sendIq("set",null,query.data);},_checkError:function(parentElement){return jabberwerx.$(parentElement).children("error")[0];}},'jabberwerx.PrivateStorageController');})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/DiscoController.js*/
;(function(jabberwerx){jabberwerx.DiscoController=jabberwerx.Controller.extend({init:function(client){this._super(client,"disco");this.applyEvent("discoInitialized");this.client.event("clientStatusChanged").bind(this.invocation("_handleStatusChange"));},destroy:function(){this.client.event('clientStatusChanged').unbind(this.invocation('_handleStatusChange'));this._super();},_handleStatusChange:function(evt){switch(evt.data.next){case jabberwerx.Client.status_connected:break;case jabberwerx.Client.status_disconnected:this._pendingJids=[];this._initialized=false;break;}},startRendezvous:function(ctx){this._super(ctx);this._walkDisco();return true;},finishRendezvous:function(){this._initialized=true;this.event("discoInitialized").trigger();return this._super();},_walkDisco:function(){var info=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/disco#info}query");this.client.sendIq("get",this.client.connectedServer.jid,info.data,this.invocation('_handleDiscoInfo'));var items=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/disco#items}query");this.client.sendIq("get",this.client.connectedServer.jid,items.data,this.invocation('_handleDiscoItems'));},_handleDiscoInfo:function(stanza){var jid=stanza.getAttribute("from");if(stanza.getAttribute("type")!="error"){var server=this.client.entitySet.entity(jid);if(!server){server=new jabberwerx.Server(jid,this);this.client.entitySet.register(server);}
  var identities=jabberwerx.$(stanza).find("identity");server.identities=[];jabberwerx.$.each(identities,function(){server.identities.push(this.getAttribute("category")+"/"+this.getAttribute("type"));});var features=jabberwerx.$(stanza).find("feature");server.features=[];jabberwerx.$.each(features,function(){server.features.push(this.getAttribute("var"));});if(server.controller===this&&identities.get(0).getAttribute("name")){server.setDisplayName(identities.get(0).getAttribute("name"));}else{server.update();}}
  if(jid!=this.client.connectedServer.jid){var idx=-1;for(var i=0;i<this._pendingJids.length;i++){if(this._pendingJids[i]==jid){idx=i;break;}}
    if(idx>=0){this._pendingJids.splice(idx,1);}
    if(this._pendingJids.length==0){this.finishRendezvous();}}},_handleDiscoItems:function(stanza){var jStanza=jabberwerx.$(stanza);var items=jStanza.find("item");if(items.length==0||jStanza.attr("type")=='error'){this.finishRendezvous();return;}
  var info=new jabberwerx.NodeBuilder("{http://jabber.org/protocol/disco#info}query");var that=this;jabberwerx.$.each(items,function(){var item=that.client.entitySet.entity(this.getAttribute("jid"));if(!item){item=new jabberwerx.Server(this.getAttribute("jid"),that);that.client.entitySet.register(item);}
    that._pendingJids.push(this.getAttribute("jid"));that.client.sendIq("get",this.getAttribute("jid"),info.data,that.invocation('_handleDiscoInfo'),that.timeout);});},cleanupEntity:function(entity){entity.remove();},findByIdentity:function(identity){if(!this._initialized){throw new TypeError("Disco controller has not been initialized.");}
  var entities=[];this.client.entitySet.each(function(entity){if(entity.hasIdentity(identity)){entities.push(entity);}});return entities;},fetchInfo:function(jid,node,cb){jid=jabberwerx.JID.asJID(jid);if(!jabberwerx.$.isFunction(cb)){throw new TypeError("cb must be a function.");}
  var info=new jabberwerx.NodeBuilder(this._DISCO_INFO);if(node){if(typeof(node)=="string"){info.attribute("node",node);}else{throw new TypeError("If node is defined, it must be a string.");}}
  var callbacks=this._fetchInfoMap[this._jwesAsKey(jid,node)];if(!callbacks){this._fetchInfoMap[this._jwesAsKey(jid,node)]=[cb];}else{callbacks.push(cb);return;}
  var that=this;this.client.sendIq("get",jid,info.data,function(stanza){var identities=[];var features=[];var extras=[];var err=null;if(stanza){var iq=new jabberwerx.IQ(stanza);if(iq.isError()){err=iq.getErrorInfo();}else{var contents=jabberwerx.$(iq.getQuery()).contents();for(index=0;index<contents.length;index++){var content=contents[index];switch(content.nodeName){case("identity"):content=jabberwerx.$(content);var identity=content.attr("category")+"/";identity=identity+(content.attr("type")?content.attr("type"):"")+"/";identity=identity+(content.attr("xml:lang")?content.attr("xml:lang"):"")+"/";identity=identity+(content.attr("name")?content.attr("name"):"");identities.push(identity);break;case("feature"):features.push(jabberwerx.$(content).attr("var"));break;case("x"):if(content.getAttribute("xmlns")=="jabber:x:data"){extras.push(new jabberwerx.XDataForm(null,content));}
    break;}}}}
    var callbacks=that._fetchInfoMap[that._jwesAsKey(jid,node)];for(i=0;i<callbacks.length;i++){callbacks[i](identities,features,extras,err);}
    delete that._fetchInfoMap[that._jwesAsKey(jid,node)];},this.timeout);},_jwesAsKey:function(jid,node){return"["+(jid||"")+"]:["+(node||"")+"]";},_fetchInfoMap:{},_DISCO_INFO:"{http://jabber.org/protocol/disco#info}query",timeout:30,findByFeature:function(feature){if(!this._initialized){throw new TypeError("Disco controller has not been initialized.");}
  var entities=[];this.client.entitySet.each(function(entity){if(entity.hasFeature(feature)){entities.push(entity);}});return entities;},_initialized:false,_pendingJids:[]},'jabberwerx.DiscoController');jabberwerx.DiscoController.mixin(jabberwerx.Rendezvousable);jabberwerx.Client.intercept({init:function(){this._super.apply(this,arguments);var discoController=new jabberwerx.DiscoController(this);}});})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/PubSubController.js*/
;(function(jabberwerx){jabberwerx.PubSubController=jabberwerx.Controller.extend({init:function(client,name){this._super(client,name||"pubsub");this._cleanupMode=jabberwerx.PubSubController.CLEANUP_ALL;},destroy:function(){var that=this;this.client.entitySet.each(function(node){if(node.controller===that){node.remove();}});this._super();},node:function(node,jid){if(!(node&&typeof(node)=="string")){throw new TypeError("node must be a non-empty string");}
  jid=this._prepareJid(jid);var pstype=this._getNodeClass();var pubsub=this.client.entitySet.entity(jid,node);if(!(pubsub&&pubsub instanceof pstype)){var tmp=pubsub;pubsub=new pstype(jid,node,this);if(tmp){pubsub.apply(tmp);tmp.remove();}
    this.client.entitySet.register(pubsub);}
  return pubsub;},_prepareJid:function(jid){return jabberwerx.JID.asJID(jid).getBareJID();},_getNodeClass:function(){return jabberwerx.PubSubNode;},cleanupEntity:function(entity){if(this._cleanupMode==jabberwerx.PubSubController.CLEANUP_ALL){entity.remove();}else if(this._cleanupMode==jabberwerx.PubSubController.CLEANUP_DELEGATES){if(entity.delegate){entity.remove()}else{entity.properties.delegates={};}}else{}},_removeNodesFromEntitySet:function(mode){if(mode){var oldmode=this._cleanupMode;this._cleanupMode=mode;}
  var that=this;this.client.entitySet.each(function(node){if(node.controller===that){that.cleanupEntity(node);}});if(oldmode!==undefined){this._cleanupMode=oldmode;}},_cleanupMode:null},"jabberwerx.PubSubController");jabberwerx.PubSubController.CLEANUP_ALL="all";jabberwerx.PubSubController.CLEANUP_DELEGATES="delegates";})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/PEPController.js*/
;(function(jabberwerx){jabberwerx.PEPController=jabberwerx.PubSubController.extend({init:function(client){this._super(client,"pep");this._cleanupMode=jabberwerx.PubSubController.CLEANUP_DELEGATES;},destroy:function(){this._super();},node:function(node,jid){return this._super(node,jid);},_prepareJid:function(jid){return(jid)?this._super(jid):undefined;},_getNodeClass:function(){return jabberwerx.PEPNode;}},"jabberwerx.PEPController");})(jabberwerx);
/**
 *
 * Copyrights
 *
 * Portions created or assigned to Cisco Systems, Inc. are
 * Copyright (c) 2010 Cisco Systems, Inc.  All Rights Reserved.
 */
/*build/dist/CAXL-release-2014.04.10787/src/jabberwerx.cisco.js*/
;(function(jabberwerx){jabberwerx.cisco={version:'2014.04.0',_config:{},_init:function(){jabberwerx._config.cisco=jabberwerx.$.extend(true,{},this._config);this._inited=true;}};jabberwerx.$.extend(jabberwerx.xhtmlim.allowedTags,{caption:["style"],table:["style","border","cellpadding","cellspacing","frame","summary","width"],td:["style","align","char","charoff","valign","abbr","axis","colspan","headers","rowspan","scope"],th:["style","abbr","axis","colspan","headers","rowspan","scope"],tr:["style","align","char","charoff","valign"],col:["style","align","char","charoff","valign","span","width"],colgroup:["style","align","char","charoff","valign","span","width"],tbosy:["style","align","char","charoff","valign"],thead:["style","align","char","charoff","valign"],tfoot:["style","align","char","charoff","valign"]});jabberwerx.cisco._init();})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/cupha.js*/
;(function(jabberwerx){function __log(msg){jabberwerx.util.debug.log("[jabberwerx.cisco.cupha]: "+msg);};var CUPHA_PREFIX="caxl::";function __checkStore(){if(!jabberwerx.$.jStore||!jabberwerx.$.jStore.isReady||!jabberwerx.$.jStore.CurrentEngine.isReady){throw new jabberwerx.util.JWStorageRequiresjQueryjStoreError();}};function __storeNodeInfo(key,value){__checkStore();value=CUPHA_PREFIX+value;jabberwerx.$.jStore.store(key,value);};function __removeNodeInfo(key){__checkStore();jabberwerx.$.jStore.remove(key);};function __getNodeInfo(key){__checkStore();var value=jabberwerx.$.jStore.store(key);if(typeof(value)=="string"){value=value.substring(CUPHA_PREFIX.length,value.length);}else{value=null;}
  return value;};jabberwerx.cisco.cupha={_getPersistedNodes:function(jid){var result={home:undefined,backup:undefined};try{jid=jid&&jabberwerx.JID.asJID(jid).getBareJIDString();result.home=__getNodeInfo('_jw_store_.cup.sd.home.'+jid)||null;result.backup=__getNodeInfo('_jw_store_.cup.sd.backup.'+jid)||null;}catch(ex){__log("Could not fetch persisted node information from localstorage.");}
  __log("Stored home node is: "+result.home);__log("Stored backup node is: "+result.backup);return result;},_setPersistedNodes:function(jid,nodes){var home=(nodes&&nodes.home)||null;var backup=(nodes&&nodes.backup)||null;jid=(jid&&jabberwerx.JID.asJID(jid).getBareJIDString())||null;if(jid){try{__removeNodeInfo('_jw_store_.cup.sd.home.'+jid);__removeNodeInfo('_jw_store_.cup.sd.backup.'+jid);if(home){__storeNodeInfo('_jw_store_.cup.sd.home.'+jid,home);}
  if(backup){__storeNodeInfo('_jw_store_.cup.sd.backup.'+jid,backup);}}catch(ex){__log("Could not persist home and backup nodes: "+ex.message);}}},_parseURL:function(url){var result={original:url,protocol:"",host:"",hostname:"",port:"",path:"",cupNode:"",cupDomain:"",isIP:false}
  if(!url){return result;}
  var purl=jabberwerx.Stream.URL_PARSER.exec(url);if(!purl){return result;}
  result.protocol=purl[1]||"";result.path=purl[3]||"";result.host=purl[2]||"";if(result.host){result.isIP=jabberwerx.cisco.cupha.IPv4_PATTERN.test(result.host);if(result.isIP){var parts=result.host.split(':');if(parts.length>1){result.hostname=parts[0];result.port=parts[1];}else{result.hostname=result.host;}}else{result.isIP=!jabberwerx.cisco.cupha.DNS_HOST_PATTERN.test(result.host);if(result.isIP){jabberwerx.util.debug.warn("CUPHA: Assuming '"+result.host+"' is an IPv6 address. If this is not an IPv6 address there is likely a configuration issue.");}else{var parts=result.host.split(':');if(parts.length>1){result.hostname=parts[0];result.port=parts[1];}else{result.hostname=result.host;}
    parts=result.hostname.split(".");if(parts.length==1){result.cupNode=parts[0];}else if(parts.length==2){result.cupDomain=parts.join(".");}else{result.cupNode=parts[0];parts=parts.slice(1);result.cupDomain=parts.join(".");}}}}
  return result;},_buildURL:function(purl){var retstr=purl.protocol+(purl.protocol?"//":"");if(purl.isIP){if(purl.hostname){retstr+=purl.hostname;retstr+=(purl.port?":":"")+purl.port;}else{retstr+=purl.host;}}else{if(!purl.cupNode&&!purl.cupDomain){retstr+=purl.hostname;}else{retstr+=(purl.cupNode+((purl.cupNode&&purl.cupDomain)?".":"")+purl.cupDomain);}
  retstr+=(purl.port?":":"")+purl.port;}
  retstr+=(purl.path?"/":"")+purl.path;return retstr;},_computeURL:function(sdURL,node){var result="";if(!node){result=sdURL;}else{sdURL=jabberwerx.cisco.cupha._parseURL(sdURL);node=jabberwerx.cisco.cupha._parseURL(node);if((!sdURL.protocol&&!sdURL.host&&sdURL.path)&&(!node.protocol&&!node.isIP&&!node.path)){result="/"+node.original;}
else if(!node.protocol&&!node.host&&node.path){result=node.original;}else{if(node.isIP||sdURL.isIP){sdURL.isIP=node.isIP;if(node.hostname){sdURL.hostname=node.hostname;}else{sdURL.host=node.host;sdURL.hostname=sdURL.port="";}
  sdURL.cupNode=sdURL.cupDomain="";}else if((sdURL.cupDomain&&node.cupDomain&&sdURL.cupDomain.indexOf(node.cupDomain,sdURL.cupDomain.length-node.cupDomain.length)!==-1)||(node.cupNode&&!node.cupDomain))
{sdURL.cupNode=node.cupNode;}
  result=jabberwerx.cisco.cupha._buildURL(sdURL);}}
  return result;},_newCUPHA:function(cparams,jid){var cupha={enabled:false,primarySD:null,attemptedPrimarySD:false,secondarySD:null,currentSD:undefined,homeNode:undefined,backupNode:undefined,currentNode:undefined,currentURL:undefined}
  cupha.enabled=(cparams&&cparams.sdEnabled)||false;if(cupha.enabled){cupha.primarySD=cparams.httpBindingURL;cupha.secondarySD=cparams.httpBindingURL_secondary||null;var pnodes=jabberwerx.cisco.cupha._getPersistedNodes(jid);cupha.homeNode=pnodes.home;cupha.backupNode=pnodes.backup;if(cupha.homeNode){cupha.currentNode=cupha.homeNode;}else if(cupha.backupNode){cupha.currentNode=cupha.backupNode;}else{cupha.currentNode=null;}
    if(cupha.primarySD){cupha.currentSD=cupha.primarySD;}else if(cupha.secondarySD){cupha.currentSD=cupha.secondarySD;}else{cupha.currentSD=null;}}
  return cupha;},_httpBindingURL:function(cupha){cupha.currentURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.currentNode);return cupha.currentURL;},_resetToPrimary:function(cupha){cupha.currentNode=cupha.homeNode=cupha.backupNode=null;cupha.currentSD=cupha.primarySD;cupha.attemptedPrimarySD=false;},_updateOnDisconnect:function(cupha){var curl=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.currentNode);if(cupha.currentURL!=curl)
{__log("Retrying current node ["+cupha.currentNode+"]");cupha.currentURL=curl;return true;}
  if((cupha.currentNode!==null)&&(cupha.currentNode==cupha.homeNode)&&cupha.backupNode)
  {__log("Failed to connect home node ["+cupha.homeNode+"], and now try backup node ["+cupha.backupNode+"]");cupha.currentNode=cupha.backupNode;cupha.currentURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.currentNode);return true;}
  cupha.currentNode=null;if(!cupha.attemptedPrimarySD)
  {cupha.attemptedPrimarySD=true;cupha.currentSD=cupha.primarySD;cupha.currentNode=null;__log("Both home and backup node are down, retrying the SD-Primary node, Service Discovery URL ="+cupha.currentSD);cupha.currentURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.currentNode);return true;}
  if((cupha.currentSD==cupha.primarySD)&&cupha.secondarySD&&(cupha.secondarySD!=cupha.primarySD))
  {cupha.currentSD=cupha.secondarySD;__log("Failed to connect to SD-Primary nodes, trying SD-Secondary: "+cupha.currentSD);cupha.currentURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.currentNode);return true;}
  __log("Could not connect to primary and secondary Service Discovery servers. Try again later.");return false;},_updateUserNodes:function(cupha,feats,jid){jid=jabberwerx.JID.asJID(jid);var hosts=[];if(feats){jabberwerx.$(feats).find("mechanisms[xmlns='urn:ietf:params:xml:ns:xmpp-sasl']>hostname").each(function(){hosts.push(jabberwerx.$(this).text());});}
  if(hosts.length===0){jabberwerx.util.debug.warn("CUP HA: High Availablility information not returned from Service Discovery server.");__log("No user's home and backup node returned from server, this might be caused by");__log("1) CUP Server is running a pre CUP 8.5 version & does not support High Availability or");__log("2) High Availability may be disabled on the cluster or");__log("3) User is not assigned to a node within the subcluster.");cupha.homeNode=cupha.backupNode=null;cupha.currentNode=null;jabberwerx.cisco.cupha._setPersistedNodes(jid);return false;}
  cupha.homeNode=hosts[0];cupha.backupNode=hosts[1]||null;jabberwerx.cisco.cupha._setPersistedNodes(jid,{home:cupha.homeNode,backup:cupha.backupNode});__log("User ["+jid.getBareJIDString()+"]'s home node is "+cupha.homeNode+" and backup node is "+cupha.backupNode);var homeURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.homeNode);var backupURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.backupNode);var isHome=(cupha.currentURL==homeURL);if(isHome||(cupha.currentURL==backupURL))
  {__log("Already connecting to user's "+(isHome?"home":"backup")+" node: "+cupha.currentURL);return false;}
  cupha.currentNode=cupha.homeNode;cupha.currentURL=jabberwerx.cisco.cupha._computeURL(cupha.currentSD,cupha.currentNode);__log("Reopening stream after updating user nodes");return true;}};jabberwerx.cisco.cupha.ClientMixin={_reopenStream:function(){this._clearStreamHandlers();this._stopReceiveQueue(true);if(this._stream.isOpen()){this._setStreamHandler('streamClosed','_handleClosedDuringReopen');try{this._stream.close();}catch(e){__log("Exception during _reopenStream, ignoring: "+e.message);setTimeout(this.invocation('_openStream'),10);}}else{setTimeout(this.invocation('_openStream'),10);}},_handleClosedDuringReopen:function(){this._clearStreamHandler("streamClosed");setTimeout(this.invocation('_openStream'),10);},_newConnectParams:function(jid,password,arg){var result=this._super(jid,password,arg);result.sdEnabled=(arg.serviceDiscoveryEnabled==="true")||(jabberwerx._config.serviceDiscoveryEnabled==="true");result.httpBindingURL_secondary=arg.httpBindingURL_secondary||jabberwerx._config.httpBindingURL_secondary||"";result.bindRetryCountdown=arg.bindRetryCountdown||jabberwerx._config.bindRetryCountdown;result.bindRetryCountdown=Number(result.bindRetryCountdown);if(result.bindRetryCountdown<=0){result.bindRetryCountdown=jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT;}
  if(!result.arg.reconnecting){__log("CUP High-Availability features are "+(result.sdEnabled?"enabled":"disabled"));if(!result.sdEnabled){result.arg.cupha=jabberwerx.cisco.cupha._newCUPHA();}else{result.arg.cupha=jabberwerx.cisco.cupha._newCUPHA(result,jid);}}
  return result;},_filterStreamOpts:function(cparams){var result=this._super(cparams);if(cparams.sdEnabled){result.httpBindingURL=jabberwerx.cisco.cupha._httpBindingURL(cparams.arg.cupha);__log("BOSH URL is: "+result.httpBindingURL);}
  return result;},_handleAuthOpened:function(feats){if(!this._connectParams.sdEnabled||!jabberwerx.cisco.cupha._updateUserNodes(this._connectParams.arg.cupha,feats.data,this._connectParams.jid))
{this._super(feats);}else{try{this._reopenStream();}catch(ex){this._handleConnectionException(ex);}}},_handleClosed:function(err){if(this._connectParams.sdEnabled&&err&&err.data&&!this._connectParams.arg.register&&(this.clientStatus==jabberwerx.Client.status_connecting))
{if(this._connectParams.bindResourceTimer!==undefined){jabberwerx.system.clearTimeout(this._connectParams.bindResourceTimer);delete this._connectParams.bindResourceTimer;}
  if(jabberwerx.cisco.cupha._updateOnDisconnect(this._connectParams.arg.cupha))
  {try{this._reopenStream();return;}catch(ex){__log("Unhandled exception trying to reopen the stream during reconnection attempt: "+ex.message);}}}
  this._super(err);},_handleBindOpened:function(feats){if(this._connectParams.sdEnabled){this._connectParams.bindResourceTimer=jabberwerx.system.setTimeout(this.invocation("_handleBindTimeout"),this._connectParams.bindRetryCountdown*1000);}
  this._super(feats);},_handleBindElements:function(elements){if(this._connectParams.bindResourceTimer!==undefined){jabberwerx.system.clearTimeout(this._connectParams.bindResourceTimer);delete this._connectParams.bindResourceTimer;}
  this._super(elements);},_handleBindTimeout:function(){delete this._connectParams.bindResourceTimer;try{__log("No response from binding resource request, reopen the stream....");if(jabberwerx.cisco.cupha._updateOnDisconnect(this._connectParams.arg.cupha)){this._reopenStream();}else{__log("No nodes or service discovery servers left to try. Failing connection attempt.");this._handleConnectionException(jabberwerx.Stream.ERR_SERVICE_UNAVAILABLE);}}catch(ex){jabberwerx.util.debug.warn("CUPHA _handleBindTimeout threw an unhandled exception while attempting to reopen stream: "+ex.message);this._handleConnectionException(ex);}},_disconnected:function(err){if(!this._connectParams.sdEnabled){this._super(err);return;}
  if(this._connectParams.bindResourceTimer!==undefined){jabberwerx.system.clearTimeout(this._connectParams.bindResourceTimer);delete this._connectParams.bindResourceTimer;}
  if(err){var changeNode=(this.clientStatus==jabberwerx.Client.status_reconnecting);changeNode=changeNode||(jabberwerx.$("system-shutdown",err).length!==0);changeNode=changeNode||(jabberwerx.$("see-other-host",err).length!=0);}
  this._super(err);if(this._countDownOn==0){this._connectParams.arg.cupha=jabberwerx.cisco.cupha._newCUPHA();}else if((this._countDownOn!=0)&&changeNode){if(!jabberwerx.cisco.cupha._updateOnDisconnect(this._connectParams.arg.cupha)){jabberwerx.cisco.cupha._resetToPrimary(this._connectParams.arg.cupha);}
    __log("Connection failed, and now try : "+jabberwerx.cisco.cupha._httpBindingURL(this._connectParams.arg.cupha)+" in "+this._countDownOn+" seconds.");}else{__log("Reconnect to the last connected node: "+jabberwerx.cisco.cupha._httpBindingURL(this._connectParams.arg.cupha)+" in "+this._countDownOn+" seconds.");}},_shouldReconnect:function(err){return this._super(err)||(this._connectParams.sdEnabled&&((jabberwerx.$("see-other-host",err).length!=0)||(jabberwerx.$("system-shutdown",err).length!=0)));}};jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT=30;jabberwerx.cisco.cupha.IPv4_PATTERN=/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(?:(\:[0-9]*))*$/,jabberwerx.cisco.cupha.DNS_HOST_PATTERN=/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])(?:(\:[0-9]*))*$/;jabberwerx.Client.intercept(jabberwerx.cisco.cupha.ClientMixin);jabberwerx.$.extend(true,jabberwerx._config,{serviceDiscoveryEnabled:false,httpBindingURL_secondary:"/httpbinding",bindRetryCountdown:jabberwerx.cisco.cupha.DEFAULT_CONNECTION_TIMEOUT});})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/DirectoryGroupsController.js*/
;(function(jabberwerx){jabberwerx.cisco.DirectoryGroupsController=jabberwerx.Controller.extend({searchID:100,init:function(client){this._super(client,'directory');this.pubsubController=client.controllers.pubsub||new jabberwerx.PubSubController(client);this.discoController=client.controllers.disco||new jabberwerx.DiscoController(client);this.client=client;this.applyEvent('LDAPContactAdded');this.applyEvent('LDAPContactRemoved');this.applyEvent('LDAPGroupRemoved');this.applyEvent('LDAPGroupNameUpdated');this.applyEvent('LDAPGroupSearchResults');this.applyEvent('LDAPUserSearchResults');this._ldapContacts={};this._ldapGroups={};this._itemsBuff=[];this._subcrbItemsBuff=[];client.event("clientDisconnected").bind(this.invocation("_onClientDisconnected"));},destroy:function(){this.client.event("clientDisconnected").unbind(this.invocation("_onClientDisconnected"));this._super();},activateSubscriptions:function(){jabberwerx.util.debug.log("activateSubscriptions","","");if(!this._hasLDAPFeature()){throw new this.errors.ActiveGroupServerFailedError();}
  var groupServerHost=this._getGroupServerHost();this.client.event('messageReceived').bindWhen("message[from='"+groupServerHost+"'] event[xmlns='http://jabber.org/protocol/pubsub#event']",this.invocation("_onLdapGroupReceived"));var activate=new jabberwerx.Presence();activate.setTo(groupServerHost);new jabberwerx.NodeBuilder(activate.getNode()).element('{http://webex.com/connect/cs}x',{'type':'initial'});this.client.sendStanza(activate);},_hasLDAPFeature:function(){return this.discoController.findByFeature('http://webex.com/connect/cs').length>0;},_cacheLdapContact:function(groupId,jid){var group=this._ldapContacts[groupId];if(!group){group=this._ldapContacts[groupId]={};}
  group[jid]=true;},_cacheLdapGroups:function(groupId,groupName){this._ldapGroups[groupId]=groupName;},isLDAPContact:function(jid){for(var i in this._ldapContacts){var group=this._ldapContacts[i];if(group[jid]){return true;}}
  return false;},_onClientDisconnected:function(err){this._ldapContacts={};this._ldapGroups={};delete this.groupServerHost;},_onLdapGroupReceived:function(stanza){var node=jabberwerx.$(stanza.data);var groupItem=jabberwerx.$("items",node[0]._DOM);if(groupItem.length>0){this._updateLdapGroup(groupItem);}
  var delGroupItem=jabberwerx.$("delete",node[0]._DOM);if(delGroupItem.length>0){this._deleteLdapGroup(delGroupItem);}},_updateLdapGroup:function(groups){for(var i=0,groupItem,l=groups.length;i<l;i++){groupItem=jabberwerx.$(groups[i]);var groupid=groupItem.attr("node"),groupname=groupItem.attr("name"),items=jabberwerx.$('item',groupItem),retracts=jabberwerx.$('retract',groupItem),member,jid,displayName;if(retracts.length==0&&groupname){this._cacheLdapGroups(groupid,groupname);this.event('LDAPGroupNameUpdated').trigger({groupid:groupid,groupname:groupname});}else if(retracts.length>0){for(var i=0,l=retracts.length;i<l;i++){jid=jabberwerx.$(retracts[i]).attr("id");this.event('LDAPContactRemoved').trigger({jid:jid,groupid:groupid});if(this._ldapContacts[groupid]){delete this._ldapContacts[groupid];}}
  break;}
  if(this._itemsBuff.length===0){var buffIdx=0,itemIdx=0,that=this;var iterateItem=function(){clearTimeout(h);items=that._itemsBuff[buffIdx]||[];groupid=items.length&&items[0].parentNode.getAttribute("node");for(var i=0,l=items.length;itemIdx<l;itemIdx++,i++){if(i>100){break;}
    member=jabberwerx.$("member",items[itemIdx]);jid=member.attr("username");displayName=member.attr("displayname");that._cacheLdapContact(groupid,jid);that.event('LDAPContactAdded').trigger({jid:jid,groupid:groupid,displayName:displayName});}
    if(itemIdx==items.length){itemIdx=0;buffIdx++;}
    if(that._itemsBuff.length>buffIdx){h=setTimeout(arguments.callee,100);}else{that._itemsBuff=[];}}
    var h=setTimeout(iterateItem,500);}
  this._itemsBuff.push(items);}},_deleteLdapGroup:function(groupItem){for(var i=0,groupid,item,l=groupItem.length;i<l;i++){item=jabberwerx.$(groupItem[i]);groupid=item.attr("node");this.event('LDAPGroupRemoved').trigger({groupid:groupid});}},_getGroupServerHost:function(){if(!this.groupServerHost){this.discoController=this.client.controllers.disco;if(!this.discoController){throw this.errors.NoGroupAddressError;}
  var entities=this.discoController.findByIdentity("component/generic");for(var i=0,l=entities.length;i<l;i++){if(entities[i].hasFeature("http://webex.com/connect/cs")){this.groupServerHost=entities[i].jid.toString();break;}}}
  return this.groupServerHost;},searchGroup:function(groupName,count){var groupServerHost=this._getGroupServerHost();var query=new jabberwerx.NodeBuilder('{jabber:iq:search}query').element('{jabber:x:data}x',{'type':'submit'});query.element('field',{'type':'hidden','var':'FORM_TYPE'}).element('value').text('http://webex.com/connect/cs');query.element('field',{'var':'groupname'}).element('value').text(groupName);query.element('field',{'var':'count'}).element('value').text(count);var resultId=++this.searchID;var that=this;this.client.sendIq("set",groupServerHost,query.document,function(stanza){var items=jabberwerx.$('item',stanza);var ldapGroups=[];for(var i=0;i<items.length;i++){var item={};var fields=jabberwerx.$("field",items[i]);for(var j=0;j<fields.length;j++){var field=fields[j];var name=jabberwerx.$(field).attr("var");if(name=="groupid"||name=="groupname"){var value=jabberwerx.$('value',field).text();item[name]=value;}}
  ldapGroups.push(item);that._cacheLdapGroups(item['groupid'],item['groupname']);}
  that.event('LDAPGroupSearchResults').trigger({resultid:resultId,ldapGroups:ldapGroups});});return this.searchID;},searchUsersByFields:function(searchFields,count){if(!count&&count>0){searchFields["count"]=count;}
  return this._searchUsers(searchFields,count);},_searchUsers:function(searchArgs,count){var groupServerHost=this._getGroupServerHost();var query=new jabberwerx.NodeBuilder('{jabber:iq:search}query').element('{jabber:x:data}x',{'type':'submit'});query.element('field',{'type':'hidden','var':'FORM_TYPE'}).element('value').text('http://webex.com/connect/cs');for(var arg in searchArgs){query.element('field',{'var':arg}).element('value').text(searchArgs[arg]);}
  var that=this;var resultId=++this.searchID;this.client.sendIq("set",groupServerHost,query.document,function(stanza){var items=jabberwerx.$('item',stanza);var ldapUsers=[];for(var i=0;i<items.length;i++){var item={};var fields=jabberwerx.$("field",items[i]);for(var j=0;j<fields.length;j++){var field=fields[j];var name=jabberwerx.$(field).attr("var");if(name=="email"||name=="username"||name=="jobtitle"||name=="displayname"||name=="phone"){var value=jabberwerx.$('value',field).text();item[name]=value;}}
    ldapUsers.push(item);}
    that.event('LDAPUserSearchResults').trigger({resultid:resultId,ldapUsers:ldapUsers});});return this.searchID;},subscribeGroup:function(groupId){var groupServerHost=this._getGroupServerHost();var groupNode=this.pubsubController.node(groupId,groupServerHost);var that=this;groupNode.event("pubsubItemsChanged").bind(this.invocation("_onSubscribeGroup"));groupNode.subscribe(function(){var groupName=that._ldapGroups[groupId];that.event('LDAPGroupNameUpdated').trigger({groupid:groupId,groupname:groupName});});},_onSubscribeGroup:function(groupObj){if(this._subcrbItemsBuff.length===0){var groupId=groupObj.source.node;var that=this;var iterateItem=function(){clearTimeout(h);var groupObj=that._subcrbItemsBuff.shift();var groupId=groupObj.source.node;var items=groupObj.data.items;for(var i=0;i<items.length;i++){var item=items[i];var displayName=jabberwerx.$(item.data).attr("displayname");var jid=jabberwerx.$(item.data).attr("username");that._cacheLdapContact(groupId,jid);that.event('LDAPContactAdded').trigger({jid:jid,groupid:groupId,displayName:displayName});}
  var groupServerHost=that._getGroupServerHost();var groupNode=that.pubsubController.node(groupId,groupServerHost);groupNode.destroy();if(that._subcrbItemsBuff.length>0){h=setTimeout(arguments.callee,100);}};var h=setTimeout(iterateItem,10);}
  this._subcrbItemsBuff.push(groupObj);},unsubscribeGroup:function(groupId){var groupServerHost=this._getGroupServerHost();var groupNode=this.pubsubController.node(groupId,groupServerHost);var that=this;groupNode.unsubscribe(function(){that.event('LDAPGroupRemoved').trigger({groupid:groupId});});},errors:{ActiveGroupServerFailedError:jabberwerx.util.Error.extend('Can\'t active group subscription.'),NoGroupAddressError:jabberwerx.util.Error.extend('Can\'t get group server address.')}});})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/controller/QuickContactController.js*/
;(function(jabberwerx){jabberwerx.cisco.QuickContactController=jabberwerx.Controller.extend({init:function(client){this._super(client,"quickContact");this.client.event('afterMessageReceived').bindWhen('message[type="headline"] event[xmlns="http://jabber.org/protocol/pubsub#event"] items[node="http://webex.com/connect/temp-presence"]>item>presence',this.invocation('_presenceReceived'));this.client.event("clientStatusChanged").bind(this.invocation("_handleStatusChange"));jabberwerx.globalEvents.bind("resourcePresenceChanged",this.invocation("_handleResourcePresenceUpdate"));this.client.entitySet.event('entityUpdated').bind(this.invocation('_handleEntityUpdated'));this.client.entitySet.event('entityRemoved').bind(this.invocation('_handleEntityRemoved'));},destroy:function(){var client=this.client;client.event("afterMessageReceived").unbind(this.invocation("_presenceReceived"));client.event("clientStatusChanged").unbind(this.invocation("_handleStatusChange"));jabberwerx.globalEvents.unbind("resourcePresenceChanged",this.invocation("_handleResourcePresenceUpdate"));client.entitySet.event('entityUpdated').unbind(this.invocation('_handleEntityUpdated'));client.entitySet.event('entityRemoved').unbind(this.invocation('_handleEntityRemoved'));this._super();},subscribe:function(jid){jid=jabberwerx.JID.asJID(jid).getBareJID();delete this._pendingSubs[jid.toString()];delete this._pendingUnsubs[jid.toString()];var entity=this.client.entitySet.entity(jid);if(entity&&entity instanceof(jabberwerx.RosterContact)&&(entity.properties.subscription=="both"||entity.properties.subscription=="to")){throw new TypeError("Can't add roster contact as a quick contact.");}
  if(!entity||(entity instanceof jabberwerx.TemporaryEntity)){var quick=new jabberwerx.cisco.QuickContact(jid,this);if(entity){quick.apply(entity);entity.remove();entity=quick;}
    entity=quick;entity.properties.temp_sub=true;this.client.entitySet.register(entity);}else{entity.properties.temp_sub=true;this.client.entitySet.event("entityUpdated").trigger(entity);}
  if(!entity.getPrimaryPresence()){var pres=new jabberwerx.Presence();pres.setFrom(entity.jid);pres.setType("unavailable");entity.updatePresence(pres);}
  var retVal=this.client.controllers.capabilities.addFeatureToJid(jid,'http://webex.com/connect/temp-presence+notify');return retVal;},subscribeAll:function(jids,reset){if(!jabberwerx.util.isArray(jids)){throw new TypeError("jids must be an array");}
  if((reset!==undefined)&&reset){var that=this;jabberwerx.$.each(this.client.entitySet.toArray(),function(){if((this.properties.temp_sub!==undefined)&&(!that._pendingUnsubs.hasOwnProperty(this.jid))){that._pendingUnsubs[this.jid]=true;}});}
  for(var i=0;i<jids.length;++i){try{var tjid=jabberwerx.JID.asJID(jids[i]).getBareJIDString();}catch(ex){jabberwerx.util.debug.warn("Skipping "+jids[i]+", could not parse JID");continue;}
    if(this._pendingUnsubs.hasOwnProperty(tjid)){delete this._pendingUnsubs[tjid];}
    var entity=this.client.entitySet.entity(tjid);if(entity&&(entity.properties.temp_sub!==undefined)){continue;}
    if(this._pendingSubs.hasOwnProperty(tjid)){continue;}
    this._pendingSubs[tjid]=true;}
  if(!this._pendingTimer){this._processPending();}},unsubscribe:function(jid){jid=jabberwerx.JID.asJID(jid).getBareJID();delete this._pendingUnsubs[jid.toString()];delete this._pendingSubs[jid.toString()];var retVal=this.client.controllers.capabilities.removeFeatureFromJid(jid,'http://webex.com/connect/temp-presence+notify');var ent=this.client.entitySet.entity(jid);if(ent){if(ent instanceof jabberwerx.cisco.QuickContact){ent.remove();}else{delete ent.properties.temp_sub;if(ent.properties.subscription=="from"||ent.properties.subscription=="none"){ent.updatePresence(null);}
  this.client.entitySet.event("entityUpdated").trigger(ent);}}
  return retVal;},unsubscribeAll:function(jids){if(!jabberwerx.util.isArray(jids)){throw new TypeError("jids must be an array");}
  for(var i=0;i<jids.length;++i){try{var tjid=jabberwerx.JID.asJID(jids[i]).getBareJIDString();}catch(ex){jabberwerx.util.debug.warn("Skipping "+jids[i]+", could not parse JID");continue;}
    if(this._pendingSubs.hasOwnProperty(tjid)){delete this._pendingSubs[tjid];}
    var entity=this.client.entitySet.entity(tjid);if(!entity||(entity.properties.temp_sub===undefined)){continue;}
    if(this._pendingUnsubs.hasOwnProperty(tjid)){continue;}
    this._pendingUnsubs[tjid]=true;}
  if(!this._pendingTimer){this._processPending();}},removeEntity:function(entity){if(!(entity&&entity instanceof jabberwerx.cisco.QuickContact)){throw new TypeError("entity must be a quick contact");}
  var jid=entity.jid;entity.destroy();this.unsubscribe(jid);},cleanupEntity:function(entity){this.client.controllers.capabilities.removeFeatureFromJid(entity.jid,'http://webex.com/connect/temp-presence+notify');entity.remove();},willBeSerialized:function(){if(this._pendingTimer!==undefined){jabberwerx.system.clearInterval(this._pendingTimer);delete this._pendingTimer;}
  this._super();},graphUnserialized:function(){this._super();this._checkTimer();},_handleStatusChange:function(evt){if(evt.data.next==jabberwerx.Client.status_disconnected){this._pendingSubs={};this._pendingUnsubs={};this._checkTimer();}},_presenceReceived:function(eventObj){var presence=jabberwerx.$(eventObj.selected);for(var i=0;i<presence.length;i++){if(presence[i]){var prs=jabberwerx.Stanza.createWithNode(presence[i]);var bareJidStr=prs.getFromJID().getBareJIDString();var entity=this.client.entitySet.entity(bareJidStr);if(!entity){entity=new jabberwerx.cisco.QuickContact(bareJidStr,this);this.client.entitySet.register(entity);}
  entity.updatePresence(prs);}}
  return true;},_handleResourcePresenceUpdate:function(eventObj){var presence=eventObj.data.presence;var nowAvailable=eventObj.data.nowAvailable;var jid=eventObj.data.fullJid;var entity=this.client.entitySet.entity(jid.getBareJID());if(entity&&entity instanceof(jabberwerx.RosterContact)&&entity.properties.subscription!="both"&&entity.properties.subscription!="to"&&nowAvailable){var p=this.client.getCurrentPresence().clone();var item=jabberwerx.$(p.getNode()).find("c[xmlns='http://jabber.org/protocol/caps']");item.remove();p.setTo(entity.jid.getBareJID());this.client.sendStanza(p);}
  return false;},_handleEntityUpdated:function(eventObj){var entity=eventObj.data;if(entity.properties.temp_sub&&entity instanceof jabberwerx.RosterContact){if(entity.properties.subscription=="both"||entity.properties.subscription=="to"){this.unsubscribe(entity.jid);jabberwerx.util.debug.log("removing temp sub property from "+entity.jid);}else if(entity.properties.subscription=="from"){this.client.controllers.capabilities.addFeatureToJid(entity.jid,'http://webex.com/connect/temp-presence+notify');jabberwerx.util.debug.log("resending temp-presence+notify caps to "+entity.jid);}}
  return false;},_handleEntityRemoved:function(eventObj){var entity=eventObj.data;if(entity.properties.temp_sub){if(this.client.isConnected()&&!(entity instanceof jabberwerx.cisco.QuickContact)){var quick=new jabberwerx.cisco.QuickContact(entity.jid,this);quick.apply(entity);this.client.entitySet.register(quick);this.subscribe(quick.jid);}else if(!this.client.isConnected()){this.unsubscribe(entity.jid);}}
  return false;},_processPending:function(){var that=this;var queues=[{queue:this._pendingSubs,func:"subscribe"},{queue:this._pendingUnsubs,func:"unsubscribe"}];var currQueue=0;var sliceCounter=0;var totalSlices=Math.max(1,this.subscriptionSlice);while(sliceCounter<totalSlices&&currQueue<queues.length){for(var oneJID in queues[currQueue].queue){if(queues[currQueue].queue.hasOwnProperty(oneJID)){try{if(!this[queues[currQueue].func].apply(this,[oneJID])){jabberwerx.util.debug.warn(jabberwerx._("{0}({1}) returned false",queues[currQueue].func,oneJID));}}catch(ex){jabberwerx.util.debug.warn(jabberwerx._("{0}({1}) threw exception: {2}",queues[currQueue].func,oneJID,ex.message));}
  if(++sliceCounter==totalSlices){break;}}}
  currQueue++;}
  delete this._pendingTimer;this._checkTimer();},_isEmpty:function(queue){for(var p in queue){if(queue.hasOwnProperty(p)){return false;}}
  return true;},_checkTimer:function(){if(!this._isEmpty(this._pendingSubs)||!this._isEmpty(this._pendingUnsubs)){if(this._pendingTimer===undefined){var that=this;var timerTime=Math.max(0,this.subscriptionInterval)*1000;this._pendingTimer=jabberwerx.system.setTimeout(function(){that._processPending();},timerTime);}}else if(this._pendingTimer){jabberwerx.system.clearTimeout(this._pendingTimer);delete this._pendingTimer;}},_pendingSubs:{},_pendingUnsubs:{},_pendingTimer:undefined,subscriptionInterval:0.5,subscriptionSlice:10},"jabberwerx.cisco.QuickContactController");})(jabberwerx);
/*build/dist/CAXL-release-2014.04.10787/src/model/QuickContact.js*/
;(function(jabberwerx){jabberwerx.cisco.QuickContact=jabberwerx.Contact.extend({init:function(jid,quickContactCtrl){if(!(quickContactCtrl&&quickContactCtrl instanceof jabberwerx.cisco.QuickContactController)){throw new TypeError("quickContactCtrl must be provided and must be of type"+"jabberwerx.cisco.QuickContactController");}
  this._super(jid,quickContactCtrl);this.properties.temp_sub=true;},_handleUnavailable:function(presence){var pres=this.getPrimaryPresence();if(!pres){this._insertPresence(presence);}else if(pres.getType()=="unavailable"){this._clearPresenceList();this._insertPresence(presence);}}},'jabberwerx.cisco.QuickContact');})(jabberwerx);
define('jabberService', ['underscore', 'Q', 'services/tenantService'], function(_, Q, tenantService) {
  var client;
  var chatController;
  var mucController;
  var quickContactsController;
  var userPromise;
  var connectionPromise;
  var presencePriority = {
    "available": 1,
    "away": 2,
    "dnd": 3,
    "offline": 4
  };
  var model = {
    me: {},
    contacts: [],
    roomInvites: [],
    rooms: []
  };

  var tenantInfoPromise = tenantService.getTenantInfo();
  var openChat = function(jabberUsername) {
    var contact = _.find(model.contacts, function(contact) {
      return (contact.name.split('@')[0] == jabberUsername);
    });
    if (contact) {
      Ember.set(contact, "isChatOpened", true);
    }
  };

  var closeChat = function(jabberUsername) {
    var contact = _.find(model.contacts, function(contact) {
      return (contact.name.split('@')[0] == jabberUsername);
    });
    if (contact) {
      Ember.set(contact, "isChatOpened", false);
    }
  };

  var getMessagesFor = function(jabberUsername) {
    var self = this;
    var me = _.filter(model.contacts, function(contact) {
      return (contact.name.split('@')[0] == jabberUsername);
    });
    if (me.length !== 0) {
      return me[0].messages;
    }
  };


  var login = function(username, password) {
    return tenantInfoPromise.then(function(tenantInfo){
        var jabberConfig = tenantInfo.JabberInfo;
      Ember.set(model, "me.statusName", "loggingIn");
      jabberwerx._config.unsecureAllowed = jabberConfig.UnsecureAllowed;
      jabberwerx._config.httpBindingURL = jabberConfig.HttpBindingUrl;
      client = new jabberwerx.Client();
      chatController = new jabberwerx.ChatController(client);
      mucController = new jabberwerx.MUCController(client);
      quickContactsController = new jabberwerx.cisco.QuickContactController(client);

      mucController.event("mucInviteReceived").bind(function(evt) {
        var mucInvite = evt.data;
        var roomName = mucInvite.getRoom().getBareJIDString();

        var existingInvite = _.find(model.roomInvites, function(invite){
          return (invite.roomName === roomName)
        })

        if(!existingInvite) {
          var temporaryContactId = mucInvite.getInvitor().getBareJIDString();
          createTemporaryContact(temporaryContactId, "available", presencePriority["available"]);
          var invitationDetails = {
            invitor: temporaryContactId,
            roomName: roomName,
            status: "waiting"
          };

          model.roomInvites.pushObject(invitationDetails);
        }
      });

      chatController.event("chatSessionOpened").bind(function(evt) {
        var temporaryContactId = evt.data.chatSession.jid.getBareJIDString();
        var contact = createTemporaryContact(temporaryContactId, "available", presencePriority["available"]);

        evt.data.chatSession.event("chatReceived").bind(function(msgEvt) {
          if (msgEvt.data.getErrorInfo()) return;
          if (!contact.isChatOpened) {
            Ember.set(contact, 'handleChatOpen', true);
          }
          var messages = contact.messages;
          var message = {
            body: msgEvt.data.getBody(),
            received: true,
            sent: false,
            time: new Date()
          };
          messages.pushObject(message);
          Ember.set(contact, "messages", null);
          Ember.set(contact, "messages", messages);
        });
        evt.data.chatSession.event("chatSent").bind(function(msgEvt) {
          var messages = contact.messages;
          if (msgEvt.data.getErrorInfo()) return;
          var message = {
            body: msgEvt.data.getBody(),
            sent: true,
            received: false,
            time: new Date()
          };
          messages.pushObject(message);
          Ember.set(contact, "messages", null);
          Ember.set(contact, "messages", messages);
        });
        evt.data.chatSession.event("chatStateChanged").bind(function(stateEvt) {
          if (stateEvt.data.jid) {
            Ember.set(contact, "state", stateEvt.data.state);
          }
        });
      });

      var createTemporaryContact = function(temporaryContactId, status, statusPriority) {
        var contact = _.find(model.contacts, function(c) {
          return c.name === temporaryContactId;
        });

        if(!contact) {
          contact = {
            name: temporaryContactId,
            statusName: status,
            statusPriority: statusPriority,
            messages: [],
            isChatOpened: false
          };
          updateModelContacts(contact)
          addTemporaryContact(temporaryContactId.split("@")[0]);
        }
        return contact;
      }

      connectionPromise = connect(username, password);
      userPromise = connectionPromise.then(function() {
        return client.connectedUser
      })

      var contactsPromise = connectionPromise.then(function() {
        return getContacts()
      });

      userPromise.then(function(user) {
        Ember.set(model, "me", {
          name: user.getDisplayName(),
          statusName: getContactStatusName(user.getPrimaryPresence()),
          jabberId: user.jid.getBareJIDString().split("@")[0]
        })

        user.event("primaryPresenceChanged").bind(function() {
          Ember.set(model, "me.statusName", getContactStatusName(user.getPrimaryPresence()))
        })
      })

      contactsPromise.then(function(contactsInfo) {
        model.contacts.clear();
        _.each(contactsInfo, function(ci) {
          model.contacts.pushObject(ci);
        })
      })

      return userPromise.then(function() {
        return;
      }).fail(function(err) {
        return handleJabberLoginError(err.innerHTML);
      })
    })
  }

  var handleJabberLoginError = function(error) {
    if(error.indexOf("not-authorized") != -1)
      return {"statusCode": 401, "message": "Invalid Credentials"}
    return {"statusCode": 500, "message": "Internal Server Error. Unable to connect to Jabber Server"}
  }

  var connect = function(username, password) {
    return tenantInfoPromise.then(function(tenantInfo) {
        var jabberConfig = tenantInfo.JabberInfo;
      var deferredConnection = Q.defer();
      var arg = {
        httpBindingURL: jabberConfig.HttpBindingUrl,
        successCallback: function success() {
          Ember.set(model, "me.statusName", "loggedIn");
          deferredConnection.resolve();
          this;
        },
        errorCallback: function(err) {
          console.log(err);
          Ember.set(model, "me.statusName", "loginFailed");
          deferredConnection.reject(err)
        }
      }

      client.connect(username + "@" + jabberConfig.Domain, password, arg);

      return deferredConnection.promise;
    })
  }

  var updateModelContacts = function(contact) {
    var existingContact = _.find(model.contacts, function(c) {
      return c.name === contact.name;
    });
    if (existingContact) {
      Ember.set(existingContact, "statusName", contact.statusName)
      Ember.set(existingContact, "statusPriority", contact.statusPriority)
    } else {
      model.contacts.pushObject(contact);
    }
    _.sortBy(model.contacts, function(contact) {
      return contact.statusPriority;
    })
  }
  var getContactStatusName = function(presence) {
    return (presence &&
      (presence.getType() || presence.getShow() || "available")) ||
      "offline"
  }

  var getContactStatusPriority = function(presence) {
    var statusName = (presence &&
      (presence.getType() || presence.getShow() || "available")) ||
      "offline"
    return presencePriority[statusName];
  }

  var getContacts = function() {
    var contactFetchDeferred = Q.defer();

    var rc = new jabberwerx.RosterController(client);
    var f = rc.fetch(function() {
      contactFetchDeferred.resolve();
    });

    return contactFetchDeferred.promise.then(function() {
      var contacts = _.filter(client.entitySet.toArray(), function(entity) {
        return (entity instanceof jabberwerx.Contact) || (entity instanceof jabberwerx.TemporaryEntity);
      })

      jabberwerx.globalEvents.bind('primaryPresenceChanged', function(evt) {
        var isRoom = isRoomEntity(evt);
        if(isRoom) return;
        var contact = evt.data;
        var contactId = contact.fullJid.getBareJIDString();
        var isConnectedUser = (client.connectedUser.jid.getBareJIDString() === contactId);
        if (!isConnectedUser) {
          updateModelContacts({
            name: contactId,
            statusName: getContactStatusName(contact.presence),
            statusPriority: getContactStatusPriority(contact.presence),
            messages: [],
            isChatOpened: false
          })
        }
      })

      var contactInfo = _.map(contacts, function(contact) {
        return {
          name: contact.getDisplayName(),
          statusName: getContactStatusName(contact.getPrimaryPresence()),
          statusPriority: getContactStatusPriority(contact.getPrimaryPresence()),
          messages: [],
          isChatOpened: false
        }
      });

      _.sortBy(contactInfo, function(contact) {
        return contact.statusPriority;
      })

      return contactInfo;
    })
  }


  var isRoomEntity = function(entity) {
    return ((entity.source._className === "jabberwerx.MUCOccupant") || (entity.source._className === "jabberwerx.MUCRoom"));
  }

  var updateUserStatus = function(status) {
    if (status === "offline") {
      logout()
    } else {
      client.sendPresence(status, "");
    }
  }

  var logout = function() {
    client.disconnect()
    model.contacts.clear()
    Ember.set(model, "me.statusName", "offline")
  }

  var sendMessage = function(to, msg) {
    tenantInfoPromise.then(function(tenantInfo) {
        var jabberConfig = tenantInfo.JabberInfo;

      if (to.split('@').length < 2) {
        to = to + "@" + jabberConfig.Domain;
      }
      connectionPromise.then(function() {
        var chatSession = chatController.openSession(to);
        chatSession.sendMessage(msg);
      })
    })
  }

  var startedTyping = function(jabberUsername) {
    tenantInfoPromise.then(function(tenantInfo) {
        var jabberConfig = tenantInfo.JabberInfo;
      var chatSession = chatController.getSession(jabberUsername + "@" + jabberConfig.Domain);
      if (chatSession) {
        chatSession.setChatState("composing");
      }
    })
  };

  var stoppedTyping = function(jabberUsername) {
    tenantInfoPromise.then(function(tenantInfo) {
        var jabberConfig = tenantInfo.JabberInfo;
      var chatSession = chatController.getSession(jabberUsername + "@" + jabberConfig.Domain);
      if (chatSession) {
        chatSession.setChatState("active");
      }
    })
  };

  var userAvailable = function(jabberUsername) {
    var user = _.find(model.contacts, function(contact) {
      return ((contact.name.split('@')[0] == jabberUsername) && (contact.statusName != "unavailable"));
    });
    return user != null
  };

  var getRoomFor = function(roomName) {
    return tenantInfoPromise.then(function(tenantInfo){
    var jabberConfig = tenantInfo.JabberInfo;
    var roomJid = jabberwerx.JID.asJID(roomName);

    if (roomJid.getNode() == '') {
      roomJid = jabberwerx.JID.asJID(roomName + "@" + jabberConfig.Conference);
    }

    var room = mucController.room(roomJid.toString());
    return room;
    })
  };

  var joinRoom = function(roomName) {
    getRoomFor(roomName).then(function(myRoom){
      var successCallBack = function() {
        appendToRooms(myRoom);
        bindRoomEvents(myRoom);
      };
      enterRoom(myRoom, successCallBack);
    });
  };

  var createRoom = function(invitees) {
    var connectedUser = client.connectedUser.jid.getNode();
    var roomName = connectedUser + new Date().getTime();
    return getRoomFor(roomName).then(function(room){
      var successCallBack = function() {
        appendToRooms(room);
        bindRoomEvents(room);
        if (invitees) {
          inviteToRoom(room.jid.getBareJIDString(), invitees)
        }
      };

      enterRoom(room, successCallBack);
      return room.jid.getBareJIDString();
    });
  };

  var enterRoom = function(room, successCallBack) {
//        bindRoomEvents(room);

    var enterRoomCallback = {
      successCallback: successCallBack,
      errorCallback: function(evt) {
        if (evt.toString().match(/conflict/)) {
          var localRoom = roomDetailsFor(room.jid.getBareJIDString())
          Ember.set(localRoom, "error", "conflict")
        }
      }
    }

    var connectedUser = client.connectedUser.jid.getBareJIDString();
    var nickName = jabberwerx.JID.unescapeNode(connectedUser);
    room.enter(nickName, enterRoomCallback);
  };

  var broadcastReceiveHandler = function(event) {
    var roomName = event.source.jid.getBareJIDString();
    var localRoom = _.find(model.rooms, function(room) {
      return room.name === roomName;
    })
    var messages = localRoom["messages"];
    if (event.data.getFrom() === roomName) return;
    // eg: event.data.getFrom() returns "user6841400476428632@conference.psdtemea.cisco.com/user684@psdtemea.cisco.com"
    var fromJabberId = event.data.getFrom().split('/').pop().split('@')[0]
    var message = {
      from: fromJabberId,
      body: event.data.getBody(),
      time: new Date()
    }
    messages.pushObject(message);
    Ember.set(localRoom, "messages", messages);
  };

  var getLocalRoomFor = function (room) {
    var roomName = room.jid.getBareJIDString();
    return _.find(model.rooms, function (localRoom) {
      return localRoom.name === roomName;
    })
  };


  var entityAddedHandler = function (event) {
    var localRoom = getLocalRoomFor(event.source.room);
    var jabberId = getJabberId(event.data);
    addOccupant(localRoom, jabberId)
  };

  var entityRemovedHandler = function (event) {
    var localRoom = getLocalRoomFor(event.source.room);
    var jabberId = getJabberId(event.data);
    removeOccupant(localRoom, jabberId);
  };

  var bindRoomEvents = function(room) {
    room.event('roomBroadcastReceived').bind(broadcastReceiveHandler);
    room.occupants.event('entityAdded').bind(entityAddedHandler);
    room.occupants.event('entityRemoved').bind(entityRemovedHandler);
  };

  var unBindRoomEvents = function(room) {
    room.event('roomBroadcastReceived').unbind(broadcastReceiveHandler);
    room.occupants.event('entityAdded').unbind(entityAddedHandler);
    room.occupants.event('entityRemoved').unbind(entityRemovedHandler);
  };

  var removeOccupant = function(localRoom, occupant) {
    if(localRoom)
      localRoom.occupantsJabberIds.removeObject(occupant);
  }

  var addOccupant = function(localRoom, occupant) {
    if(localRoom)
      localRoom.occupantsJabberIds.addObject(occupant);
  }

  var getJabberId = function(entity) {
    return entity.getNickname().split('@')[0];
  }

  var appendToRooms = function(room) {
    var occupantJabberIds = _.map(room.occupants.toArray(), function(occupant) {
      return getJabberId(occupant);
    });

    var roomDetails = {
      name: room.jid.getBareJIDString(),
      messages: [],
      occupantsJabberIds: occupantJabberIds,
      error: ""
    }
    model.rooms.pushObject(roomDetails);
  }

  var inviteToRoom = function(roomName, invitees) {
    tenantInfoPromise.then(function(tenantInfo) {
      var jabberConfig = tenantInfo.JabberInfo;
      var inviteesList = _.map(invitees, function(invitee) {
        return invitee + "@" + jabberConfig.Domain;
      });

      var room = mucController.room(roomName);

      room.invite(inviteesList, '', false);
    })
  };

  var isMyContact = function(jabberUsername) {
      return getContactFor(jabberUsername) != undefined;
  };

  var roomDetailsFor = function(roomName) {
    return _.find(model.rooms, function(localRoom) {
      return localRoom.name === roomName;
    })
  };

  var acceptRoomInvite = function(roomName) {
    var room = mucController.room(roomName);
    joinRoom(room.jid.getNode());
    removeRoomInvite(roomName)
  };

  var removeRoomInvite = function(roomName) {
    var roomInvites = model.roomInvites
    var inviteToBeRemoved = _.find(roomInvites, function(roomInvite) {
      return roomInvite.roomName === roomName;
    })
    roomInvites.removeObject(inviteToBeRemoved);
  }

  var leaveRoom = function(roomName) {
    var room = mucController.room(roomName);
    var existingRoom = _.find(model.rooms, function(localRoom) {
      return localRoom.name === roomName;
    })
    model.rooms.removeObject(existingRoom);
    unBindRoomEvents(room);
    if (room.occupants.toArray().length > 1) {
      room.exit();
    } else {
      room.destroy();
    }
  };

  var broadcastRoomMessage = function(roomName, message) {
    var room = mucController.room(roomName);
    room.sendBroadcast(message);
  };

  var addTemporaryContact = function(jabberUsername) {
    tenantInfoPromise.then(function(tenantInfo) {
        var jabberConfig = tenantInfo.JabberInfo;
      if (jabberConfig.TemporarySubscriptionEnabled && client.isConnected()) {
        quickContactsController.subscribe(jabberUsername + "@" + jabberConfig.Domain);
      }
    })
  };

  var getContactFor = function(jabberUsername) {
      var contact = _.find(model.contacts, function(contact) {
        return contact.name.split("@")[0] === jabberUsername;
      });
      return contact;
  };

  var isLoggedInUser = function(jabberUsername) {
    return jabberUsername === model.me.name;
  };

  var getLoggedInUser = function() {
    return model.me;
  };

  var isValidCredentials = function(username, password) {
    return tenantInfoPromise.then(function(tenantInfo) {
        var jabberConfig = tenantInfo.JabberInfo;
      var deferredLogin = Q.defer();
      jabberwerx._config.unsecureAllowed = jabberConfig.UnsecureAllowed;
      jabberwerx._config.httpBindingURL = jabberConfig.HttpBindingUrl;
      var client = new jabberwerx.Client();
      var arg = {
        httpBindingURL: jabberConfig.HttpBindingUrl,
        successCallback: function() {
          deferredLogin.resolve();
          this;
        },
        errorCallback: function(err) {
          deferredLogin.reject(handleJabberLoginError(err.innerHTML).message);
        }
      };

      try {
        client.connect(username + "@" + jabberConfig.Domain, password, arg);
      } catch (err) {
        deferredLogin.reject(handleJabberLoginError("not-authorized").message);
      }

      return deferredLogin.promise;
    })
  };

  return {
    model: model,
    updateUserStatus: updateUserStatus,
    login: login,
    sendMessage: sendMessage,
    startedTyping: startedTyping,
    stoppedTyping: stoppedTyping,
    openChat: openChat,
    closeChat: closeChat,
    getMessagesFor: getMessagesFor,
    userAvailable: userAvailable,
    createRoom: createRoom,
    inviteToRoom: inviteToRoom,
    acceptRoomInvite: acceptRoomInvite,
    removeRoomInvite: removeRoomInvite,
    leaveRoom: leaveRoom,
    roomDetailsFor: roomDetailsFor,
    broadcastRoomMessage: broadcastRoomMessage,
    addTemporaryContact: addTemporaryContact,
    getContactFor: getContactFor,
    getLoggedInUser: getLoggedInUser,
    isLoggedInUser: isLoggedInUser,
    isMyContact: isMyContact,
    isValidCredentials: isValidCredentials,
    handleJabberLoginError: handleJabberLoginError
  }
});