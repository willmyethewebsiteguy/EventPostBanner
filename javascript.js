/* ==========
  Event Page Banner Styles v 1.0.04
  Event Page Banner Images for Squarespace 7.1 & 7.0
  Copyright Will-Myers 
  Fixing Error with Header Element
========== */
(function(){
  let $configEl = $('[data-wm-plugin="event-post"]');

  function initEventBanner() {
    let cssFile = 'https://cdn.jsdelivr.net/gh/willmyethewebsiteguy/EventPostBanner@1.1/styles.min.css';
    addCSSFileToHeader(cssFile);
    function addCSSFileToHeader(url){
      if ($('#wm-event-banner-css').length) return;
      let head = document.getElementsByTagName('head')[0],
          link = document.createElement('link');
      link.id = 'wm-event-banner-css'
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      head.appendChild(link);
      link.onload = function(){
      };
    }
    //Config Styles
    let style = $configEl.attr("data-post-style") == undefined
    ? "1" : $configEl.attr("data-post-style"),
        headerTheme = $configEl.attr("data-theme") == undefined
    ? "black" : $configEl.attr("data-theme"),
        opacity = $configEl.attr("data-opacity") == undefined
    ? "0" : $configEl.attr("data-opacity"),
        imgSrc =  $configEl.attr("data-img-src") == undefined
    ? "thumbnail" : $configEl.attr("data-img-src"),
        baseUrl = location.protocol + "//" + location.host + location.pathname,
        $section = document.querySelector(
          "#sections > .page-section.content-collection"
        ) || document.querySelector("main.Main--events-item"),
        $sectionBackground = $section.querySelector(".section-background") ||
        document.createElement("section"),
        $sectionContent = $section.querySelector(".content-wrapper") || $section.querySelector("section.Main-content"),
        $title = $sectionContent.querySelector(".eventitem-column-meta") ||
        document.createElement("div"),
        $titleClone = $title.cloneNode(true),
        body = document.querySelector("body");

    //Get JSON Post Data
    let postData;
    $.getJSON(baseUrl + "/?format=json-pretty", {_: new Date().getTime()}, function (data) {
      postData = data;
      let posX = data.item.mediaFocalPoint.x * 100 + "%",
          posY = data.item.mediaFocalPoint.y * 100 + "%",
          focalPoint = posX + " " + posY;
      body.style.setProperty("--image-focal-point", focalPoint);
      if (imgSrc == "thumbnail") {
        imgSrc = postData.item.assetUrl
        buildImage();
      }
    });


    //If 7.0 Website
    if (window.Static.SQUARESPACE_CONTEXT.templateVersion == "7") {
      document.querySelector("body").classList.add("sqs-seven");
      $sectionBackground.classList.add("Index-page--has-image");
      //let main = document.querySelector("main.Main--blog-item");
      //$titleClone.classList.add("blog-item-top-wrapper", "clone");
      $titleClone.classList.add("clone");
      
      //Add in Section
      $section.prepend($sectionBackground);
      //Add Title Clone Content
      try {
        let title = document.querySelector(".eventitem-title").cloneNode(true);
      } catch (err) {
        console.log("No Title");
      }
    }

    body.classList.add("wm-banner-style-" + style);
    $section.classList.add("has-banner");
    $sectionBackground.classList.add("wm-event-banner");
    $titleClone.classList.add("clone");
    if ($titleClone.querySelector('[data-content-field="title"]')) {
      $titleClone.querySelector('[data-content-field="title"]').removeAttribute('data-content-field');
    }
    if ($titleClone.querySelector('[data-content-field="event-date-time-range"]')) {
      $titleClone.querySelector('[data-content-field="event-date-time-range"]').removeAttribute('data-content-field');
    }

    //Build Section Background
    let overlay = document.createElement("div"),
        sectionBackgroundImg = document.createElement("div"),
        sectionBackgroundContent = document.createElement("div");
    overlay.classList.add("section-background-overlay");
    sectionBackgroundImg.classList.add("section-background-image");
    sectionBackgroundContent.classList.add(
      "section-background-content",
      "event-item-wrapper"
    );
    if (imgSrc !== 'thumbnail') {
      buildImage() 
    }

    sectionBackgroundImg.append(overlay);

    $sectionBackground.append(sectionBackgroundImg);
    $sectionBackground.append(sectionBackgroundContent);

    //Add in Title
    sectionBackgroundContent.append($titleClone);

    //Make Content Background Same Color on 7.1
    let backgroundColor = window
    .getComputedStyle($sectionBackground)
    .getPropertyValue("background-color");
    if (window.Static.SQUARESPACE_CONTEXT.templateVersion !== "7") {
      body.style.setProperty("--section-background-color", backgroundColor);
    }

    function buildImage() {
      let img = document.createElement("img") ;
      img.setAttribute("data-src", imgSrc);
      img.src = imgSrc;
      console.log(sectionBackgroundImg);
      if (sectionBackgroundImg) {
        sectionBackgroundImg.append(img);
      }
    }

    //Set Content Width Variable
    if (window.Static.SQUARESPACE_CONTEXT.templateVersion !== "7") {
      try {
        let sectionWidth = findSectionWidth(),
            pageWidth = findMaxPageWidth();
        body.style.setProperty("--section-content-width", sectionWidth);
        body.style.setProperty("--max-page-width", pageWidth);
      } catch (err) {
        console.log(err);
      }
    }

    if (window.Static.SQUARESPACE_CONTEXT.templateVersion == "7") {
      document.addEventListener('DOMContentLoaded', function() {
        loadAllImages();
      })
    }

    //Add Class After Work Is Complete
    body.classList.add("tweak-wm-banner");
  }

  /*======= FUNCTIONS =========*/
  /*If In Edit Mode*/
  function watchEditMode() {
    const targetNode = document.querySelector("body");
    const config = {
      attributes: true,
      childList: false,
      subtree: false,
      attributeFilter: ["class"],
    };
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(ifInEditMode).observe(
      targetNode,
      config
    );
    // Callback function to execute when mutations are observed
    function ifInEditMode(mutationList, observer) {
      // Use traditional 'for loops' for IE 11
      if (targetNode.classList.contains("sqs-layout-editing")) {
        $('link#wm-event-banner-css').attr("disabled", "disabled");
        $(".wm-event-banner .section-background-content").hide();
        $(".wm-event-banner .section-background-image").hide();
      } else {
        $('link[href*="WMEventPageBanner"]').removeAttr("disabled");
        $(".wm-event-banner .section-background-image").show();
        $(".wm-event-banner .section-background-content").show();
      }
    }
  }

  /*Find Section Width in 7.1*/
  let findSectionWidth = () => {
    let width,
        tweakJSONWidth =
        window.Static.SQUARESPACE_CONTEXT.tweakJSON["tweak-blog-item-width"];
    if (tweakJSONWidth == "Narrow") {
      width = "50%";
    } else if (tweakJSONWidth == "Medium") {
      width = "75%";
    } else if (tweakJSONWidth == "Wide") {
      width = "100%";
    } else if (tweakJSONWidth == "Custom") {
      width =
        window.Static.SQUARESPACE_CONTEXT.tweakJSON[
        "tweak-blog-item-custom-width"
      ] + "%";
    }
    return width;
  };
  let findMaxPageWidth = () => {
    let width = window.Static.SQUARESPACE_CONTEXT.tweakJSON["maxPageWidth"];
    return width;
  };

  /* Get Image Aspect Ratio in 7.1 */
  let getImageAspect = () => {
    let aspectRatio,
        el = document.querySelector(".section-background-image img"),
        imgDimen = [];
    imgDimen[0] = el.getAttribute("data-image-dimensions").split("x")[0];
    imgDimen[1] = el.getAttribute("data-image-dimensions").split("x")[1];
    aspectRatio = (imgDimen[1] / imgDimen[0]) * 100 + "%";
    return aspectRatio;
  };

  /* Load Images */
  let loadAllImages = () => {
    try {
      var images = document.querySelectorAll("img[data-src]");
      for (var i = 0; i < images.length; i++) {
        ImageLoader.load(images[i], { load: true });
      }
    } catch (err) {
      console.log(err)
    }
  };

  /* init 7.1 */
  let isItem = document.querySelector('body').id.includes('item');
  if (window.Static.SQUARESPACE_CONTEXT.templateVersion !== "7") {
      if($configEl.length && isItem){
        initEventBanner();
        if (window.self !== window.top){
          watchEditMode();
        }
      }
  } else {
    window.Squarespace.onInitialize(Y, function(){
      $configEl = $('[data-wm-plugin="event-post"]');
      if($configEl.length  && isItem){
        initEventBanner();
        setTimeout(function(){
          Y.config.win.Squarespace.initializeLayoutBlocks(Y)
        }, 500)
        if (window.self !== window.top){
          watchEditMode();
        }
      }
    });
  }
}());
