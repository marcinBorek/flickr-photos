/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
               
            }
         
            callback(null, photos); 
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }
            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }
        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        img.id  = photo.substr(photo.lastIndexOf('/')+1,21);
        return img;
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
            var elm = document.createElement('div');
            elm.className = 'photo';
            elm.appendChild(img);
            /**   Favorite icon  ******/
            var elm2 = document.createElement('img');
            elm2.className = 'starIcon';
            elm2.id = 'star_' + img.id;
            //read cookie
            var cookieArray = document.cookie.split("; ");
            
            var cookieItem = '';
            elm2.src = 'favorites.png';	
            jQuery.each(cookieArray, function() {
            		cookieItem = this.split("=");
            		
                    if(cookieItem[0] == 'favoriteImage' && cookieItem[1] == elm2.id) {
                    	elm2.src = 'favorites_active.png';
                     	return;
                     }
            });

            
           
          
            //action after click on favorite icon
            $(elm2).bind('click', function() {
            	
            	//set favorite icon
            	$('.starIcon').each(function(index) {
            			this.src = 'favorites.png';
            	});
            	this.src = 'favorites_active.png';
            	//set favorite image
            	document.cookie = "favoriteImage=" + elm2.id;
            });
            
            elm.appendChild(elm2);
            
            holder.appendChild(elm);
        };
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }
            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));


