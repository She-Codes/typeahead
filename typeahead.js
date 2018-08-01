/*
  (c) 2017 Nikia Shaw, MIT License :-)
  v. 1.2
  Ex:
  var billTypeAhead = new TypeAhead({
    input:'#conferees-bill-num', 
    listElement: '#conferees-bill-num-list',
    keyNavigation: true,
    showAll: false,
    collection: [...],
    filterMatches: function(searchString, collection) {
      used to filter collection
      ...
    },
    formatMatchesForDisplay: function(collection, searchString) {
      used for creating list items
      ...
    }
  });

  emits custom 'taItemSelected' event
*/
var TypeAhead = (function () {
  'use strict';
  var defaults = {
    collection: [],
    keyNavigation: false,
    showAll: false, // will erase list otherwise if input empty
    filterMatches: function (searchString, collection) {
      var regex = new RegExp(searchString, 'gi');
      return collection.filter(function (element) {
        return element.match(regex);
      });
    },
    formatMatchesForDisplay: function (arr, searchString) {
      if (searchString) {
        return arr.map(function (item) {
          var regex = new RegExp(searchString, 'gi');
          var itemWithHighlight = item.replace(regex, '<span class="hl">$&</span>');
          return '<li>' + itemWithHighlight + '</li>';
        }).join('');
      } else {
        return arr.map(function (item) {
          return '<li>' + item + '</li>';
        }).join('');
      }
    }
  }

  function BuildTypeAhead(options) {
    var api = {
      typeAheadListActiveItemIndex: -1,
      typeAheadList: undefined,
    };
    var settings = {};
    var typeAheadUl;

    api.displayMatches = function (searchString) {
      var matchedArray, html;
      typeAheadUl = document.querySelector(settings.listElement);

      if (searchString) {
        showList();
        matchedArray = settings.filterMatches(searchString, settings.collection);
        html = settings.formatMatchesForDisplay(matchedArray, searchString);
        typeAheadUl.innerHTML = html;
        api.typeAheadList = typeAheadUl.querySelectorAll('li');
      } else if (settings.showAll) {
        showList();
        html = settings.formatMatchesForDisplay(settings.collection);
        typeAheadUl.innerHTML = html;
        api.typeAheadList = typeAheadUl.querySelectorAll('li');
      } else {
        clearList();
        api.typeAheadList = undefined;
      }
    }

    function navigateListWithKeys(key) {
      //debugger;
      var lastIndex = api.typeAheadList.length - 1;
      // if up key
      if (key === "ArrowUp") {
        // If there is an item selected, remove the active class from it
        if (api.typeAheadListActiveItemIndex !== -1) {
          api.typeAheadList[api.typeAheadListActiveItemIndex].classList.remove('active');
        }
        // If either nothing is selected or the first item is selected set index to the last item
        if (api.typeAheadListActiveItemIndex <= 0) {
          api.typeAheadListActiveItemIndex = lastIndex;
          // If anything but the first item is selected decrement the index by one (select the previous item)
        } else {
          api.typeAheadListActiveItemIndex = api.typeAheadListActiveItemIndex - 1;
        }
        // if down key
      } else if (key === "ArrowDown") {
        // If there is an item selected, remove the active class from it
        if (api.typeAheadListActiveItemIndex !== -1) {
          api.typeAheadList[api.typeAheadListActiveItemIndex].classList.remove('active');
        }

        // If either nothing or the last item is selected set index to the first item
        if (api.typeAheadListActiveItemIndex === -1 || api.typeAheadListActiveItemIndex === lastIndex) {
          api.typeAheadListActiveItemIndex = 0;
          // if any item accept the last item has the active class
        } else if (api.typeAheadListActiveItemIndex > -1 && (api.typeAheadListActiveItemIndex < lastIndex)) {
          api.typeAheadListActiveItemIndex = api.typeAheadListActiveItemIndex + 1;
        }
      }

      // now make the list item active
      api.typeAheadList[api.typeAheadListActiveItemIndex].classList.add('active');
      //api.typeAheadList[api.typeAheadListActiveItemIndex].scrollIntoView();
      document.querySelector(settings.listElement).scrollTop = api.typeAheadList[api.typeAheadListActiveItemIndex].offsetTop;
      return;
    }

    function runTypeAhead(e) {
      var target = e.target;
      var keySelectEvent;

      if (e.target != document.querySelector(settings.input)) {
        return;
      }

      if (e.key === 'Enter') {
        return;
      }

      api.displayMatches(target.value);

      if (settings.keyNavigation) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          navigateListWithKeys(e.key);

          if ((api.typeAheadListActiveItemIndex > -1) && typeof window.CustomEvent === 'function') {
            keySelectEvent = fireCustomEvent();

            api.typeAheadList[api.typeAheadListActiveItemIndex].dispatchEvent(keySelectEvent);
          }
        } else {
          document.querySelector(settings.listElement).scrollTop = 0;
          api.setActiveItemIndex(-1);
          api.typeAheadList = undefined;
        }
      }
    }

    function clearList() {
      typeAheadUl = document.querySelector(settings.listElement);
      typeAheadUl.innerHTML = '';
      typeAheadUl.classList.add('hidden');
    }

    function showList() {
      typeAheadUl = document.querySelector(settings.listElement);
      typeAheadUl.classList.remove('hidden');
    }

    function fireCustomEvent() {
      return new CustomEvent('taItemSelected', {
        bubbles: true,
        cancelable: true,
      });
    }

    api.init = function () {
      if (!options.input) {
        return;
      }
      Object.assign(settings, defaults, options);
      api.collection = settings.collection;
      api.input = settings.input;
      clearList();
      document.addEventListener('keyup', runTypeAhead);
    }

    api.addCollection = function (arr) {
      settings.collection = arr;
      api.collection = arr;
    }

    api.setActiveItemIndex = function (index) {
      api.typeAheadListActiveItemIndex = index;
    }

    api.clearTypeAhead = function () {
      clearList();
      api.setActiveItemIndex(-1);
      api.typeAheadList = undefined;
    }

    api.init();
    return api;
  };

  return BuildTypeAhead;
})();