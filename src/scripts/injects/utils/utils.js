var Utils = Classy.newClass(); // eslint-disable-line no-var

Utils.classFields({
    svgMeasurementContainer: null,
    svgMeasurementHelper: null
});

Utils.classMethods({

    dateToLocaleTimeString: function(date, period) {
        let h = date.getHours();
        const m = date.getMinutes();
        const local = new Date();

        // 12 hour clock style
        if (local.toLocaleTimeString().match(/am|pm/i)) {
            let p = "AM";
            if (h >= 12) {
                h -= 12;
                p = "PM"
            }
            if (h == 0) {
                h = 12;
            }
            return h + ":" + (m<10?"0":"")+ m + (period?" "+p:"");
        }
        // 24 hour clock style
        else {
            return (h<10?"0":"") + h + (m<10?"0":"") + m + (period?" hours":"");
        }
    },

    /**
     * Wraps a JavaScript string with a closure.
     * The string is also wrapped in a try-catch statement.
     *
     * @param string jsString
     */
    createClosure: function(jsString) {
        return "(function() { try { " + jsString + " } catch(error) { console.log(error); } })();";
    },

    // Converts hex value to object with r,g and b properties
    hexToRGB: function(hex) {
        const hexValue = parseInt(hex, 16);
        const r = (hexValue >> 16) & 255;
        const g = (hexValue >> 8) & 255;
        const b = hexValue & 255;

        return {r: r, g: g, b: b};
    },

    utf8ToBase64: function(str) {
        return base64js.fromByteArray(new TextEncoderLite().encode(str));
    },

    measureSVGText: function(text, settings) {
        if (Utils.svgMeasurementContainer === null) {
            Utils.svgMeasurementContainer = $("<div></div>");
            $("body").append(Utils.svgMeasurementContainer);

            Utils.svgMeasurementContainer.svg({settings: {width: 0, height: 0, overflow: 'hidden'}});
            Utils.svgMeasurementHelper = Utils.svgMeasurementContainer.svg('get');
        }

        Utils.svgMeasurementContainer.show();

        Utils.svgMeasurementHelper.clear();
        const result = Utils.svgMeasurementHelper.text(0, 100, text, settings).getComputedTextLength();

        Utils.svgMeasurementContainer.hide();

        return result;
    },

    getSVGScaleAndTranslateToFit: function(containerWidth, textWidth, textHeight, horizontalAlignment) {
        if (horizontalAlignment === undefined) { horizontalAlignment = 'center'; }

        let result = '';

        const scale = Math.min(1.0, containerWidth/textWidth);

        result += 'scale('+scale+')';
        switch (horizontalAlignment) {
            case 'center':
            {
                result += ' translate('+Math.round((containerWidth / scale - containerWidth) * 0.5)+', '+Math.round((textHeight / scale - textHeight) * 0.5)+')';
                break;
            }
            case 'left':
            {
                result += ' translate(0, '+Math.round((textHeight / scale - textHeight) * 0.5)+')';
                break;
            }
            case 'right':
            {
                result += ' translate('+Math.round(containerWidth / scale - containerWidth)+', '+Math.round((textHeight / scale - textHeight) * 0.5)+')';
                break;
            }
        }

        return result;
    },

    createFixedWidthButton: function(label, sizeAndTypeClasses, width) {
        const button = $("<button class='"+sizeAndTypeClasses+"' type='button' tabindex='-1' title=''></button>");
        button.text(label);
        button.css("min-width", width);

        // FIXME Does not currently work.
        /*        // Temporarily append to body to enable styling.
        $("body").append(button);

        let fontSize = parseFloat(button.css("font-size"));

        while(button.width() > width) {
            fontSize -= 0.2;
            button.css("font-size", fontSize)
        }

        // Detach again.
        button.detach();*/

        return button;
    },

    /**
     * Create an jquery object with span elements with player names
     * @param string[] playerIda
     * @param function callback
     */
    createPlayerNames: function(playerIds, callback) {
        const names = $("<span></span>");
        let count = 0;

        for (let i = 0; i < playerIds.length; i++) {
            const span = $("<span class='username'></span>");
            names.append(span);

            if (i == playerIds.length - 2) {
                names.append(" and ");
            } else if (i < playerIds.length - 2) {
                names.append(", ");
            }

            Backend.getInstance().getPlayerDetails(
                function(result) {
                    if (typeof(result) == 'object') {
                        span.text(result.getUsername());
                        count++;
                        if (count == playerIds.length) {
                            callback(names);
                        }
                    }
                },
                null,
                null,
                playerIds[i],
                Caches.getPlayerDetailsCache()
            );
        }
    },

    addOverlayFormRow: function(form, content) {
        const rowDiv = $("<div class='row'></div>");
        const rowContentDiv = $("<div class='rowContent'></div>");
        rowContentDiv.append(content);
        rowDiv.append(rowContentDiv);
        form.append(rowDiv);

        return rowContentDiv;
    },

    addSuffix: function(container, suffix, willCollapse) {
        const suffixDiv = $("<div class='suffix"+(willCollapse?" collapse":"")+"'></div>");
        suffixDiv.append(suffix);
        container.append(suffixDiv);

        return container;
    },

    addPrefix: function(container, prefix, willCollapse) {
        const prefixDiv = $("<div class='prefix"+(willCollapse?" collapse":"")+"'></div>");
        prefixDiv.append(prefix);
        container.prepend(prefixDiv);

        return container;
    },

    addImageWithClasses: function(container, classes, src) {
        const image = $("<img class='"+classes+"'/>");
        image.attr("src", g_url(src));
        // Generate srcset from src.
        if (src.substring(src.length - 4) === ".png") {
            const srcset = g_url(src.substring(0, src.length - 4) + "@2x.png") + " 2x";
            image.attr("srcset", srcset);
        }

        container.append(image);

        return container;
    },

    addAddonsImageWithClasses: function(container, classes, src) {
        const image = $("<img class='"+classes+"'/>");
        image.attr("src", t_url(src));
        // Generate srcset from src.
        if (src.substring(src.length - 4) === ".png") {
            const srcset = t_url(src.substring(0, src.length - 4) + "@2x.png") + " 2x";
            image.attr("srcset", srcset);
        }

        container.append(image);

        return container;
    },

    updateTooltip: function(element, message) {
        if (message == "") {
            element.tooltipster('disable');
        } else {
            if (element.tooltipster('content') !== message) {
                element.tooltipster('content', message);
            }
            element.tooltipster('enable');
            element.tooltipster('show');
        }
    },

    addAutomaticTextAreaResize: function(elements) {
        elements.attr('style', 'overflow-y: hidden;')
        .on('input.resize', function () {
            // Ignore resize if scrollHeight is zero.
            // scrollHeight will be zero the second time input
            // is triggered while the textarea is hidden.
            if (this.scrollHeight > 0) {
                this.style.height = 'auto';
                const borderHeight = $(this).outerHeight() - $(this).innerHeight();
                this.style.height = (this.scrollHeight + borderHeight) + 'px';
            }
        });
    },

    removeAutomaticTextAreaResize: function(elements) {
        elements.removeAttr('style');
        elements.off('input.resize');
    },

    arrayToNaturalString: function(input) {
        let result = "";

        for (let i = 0; i < input.length; ++i) {
            result += input[i];
            if (i == input.length - 2) {
                result += " and ";
            } else if (i < input.length - 2) {
                result += ", ";
            }
        }

        return result;
    },

    timeDiffToString: function(now, then) {
        if (now > then) {
            return "no time";
        } else {
            const diff = then - now;
            if (diff > 2 * 604800000) { // 2 weeks in ms
                const weeks = Math.floor(diff / 604800000);
                return weeks + " weeks";
            }
            if (diff > 2 * 86400000) { // 2 days in ms
                const days = Math.floor(diff / 86400000);
                return days + " days";
            }
            if (diff > 2 * 3600000) { // 2 hours in ms
                const hours = Math.floor(diff / 3600000);
                return hours + " hours";
            }
            if (diff > 2 * 60000) { // 2 minutes in ms
                const minutes = Math.floor(diff / 60000);
                return minutes + " minutes";
            }

            const seconds = Math.floor(diff / 1000);
            return seconds + " second" + (seconds !== 1 ?"s":"");
        }
    },

    placeBoxBestLocation: function(element, x, y, preferredDirections, preferredRadiusHorizontal, preferredRadiusVertical, tabSize, verticalTabPos, margins, collision) {
        if (margins === undefined) {
            margins = [0, 0, 0, 0];
        }

        let foundPlacement = false;
        let bestFit = "";
        let highestRatioVisible = 0.0;

        for (let i = 0; i < preferredDirections.length; ++i) {

            Utils.placeBox(element, x, y, preferredDirections[i], preferredRadiusHorizontal, preferredRadiusVertical, 30, 35, collision);

            // Check if element fits in viewport
            if (Utils.containedInViewport(element, margins)) {
                foundPlacement = true;
                break;
            } else {
                const ratioVisible = Utils.computeVisibleRatio(element, margins);

                if (ratioVisible > highestRatioVisible) {
                    bestFit = preferredDirections[i];
                    highestRatioVisible = ratioVisible;
                }
            }
        }

        // If not placed, place at best fit.
        if (!foundPlacement) {
            Utils.placeBox(element, x, y, bestFit, preferredRadiusHorizontal, preferredRadiusVertical, 30, 35, collision);
        }
    },

    placeBox: function(element, x, y, direction, preferredRadiusHorizontal, preferredRadiusVertical, tabSize, verticalTabPos, collision) {
        if (collision === undefined) {
            collision = "none";
        }

        element.removeClass("left right top bottom");
        switch(direction) {
            case "right":
            {
                element.position({my: "left top", at: "left+"+(x+preferredRadiusHorizontal+tabSize)+" top+"+(y-verticalTabPos), of: $(document), collision: collision});
                element.addClass("left");
                element.css({transformOrigin: '-15% 35px'});
                break;
            }
            case "left":
            {
                element.position({my: "right top", at: "left+"+(x-preferredRadiusHorizontal-tabSize)+" top+"+(y-verticalTabPos), of: $(document), collision: collision});
                element.addClass("right");
                element.css({transformOrigin: '115% 35px'});
                break;
            }
            case "top":
            {
                element.position({my: "center bottom", at: "left+"+x+" top+"+(y-preferredRadiusVertical-tabSize), of: $(document), collision: collision});
                element.addClass("bottom");
                element.css({transformOrigin: '50% 110%'});
                break;
            }
            case "bottom":
            {
                element.position({my: "center top", at: "left+"+x+" top+"+(y+preferredRadiusVertical), of: $(document), collision: collision});
                element.addClass("top");
                element.css({transformOrigin: '50% -10%'});
                break;
            }
        }
    },

    containedInViewport: function(element, margins) {
        const clientRect = element[0].getBoundingClientRect();
        if (clientRect.left - margins[3] < 0 || clientRect.top - margins[0] < 0) {
            return false;
        }

        const width = $(window).width();
        const height = $(window).height();
        if (clientRect.right + margins[1] > width || clientRect.bottom + margins[2] > height) {
            return false;
        }

        return true;
    },

    computeVisibleRatio: function(element, margins) {
        const clientRect = element[0].getBoundingClientRect();
        const totalArea = (clientRect.width + margins[1] + margins[3]) * (clientRect.height + margins[0] + margins[2]);

        const width = $(window).width();
        const height = $(window).height();

        const left = Math.max(clientRect.left - margins[3], 0);
        const top = Math.max(clientRect.top - margins[0], 0);
        const right = Math.min(clientRect.right + margins[1], width);
        const bottom = Math.min(clientRect.bottom + margins[2], height);
        const visibleArea = (right - left) * (bottom - top);

        return visibleArea / totalArea;
    },

    maskUnapprovedUsername: function(playerDetails) {
        const adminStatus = this.getAdminStatus(playerDetails);
        let username = "";

        if (adminStatus === "active") {
            username = "(GM" + playerDetails.getGmLevel() + ") " + username;
        } else if (adminStatus === "retired") {
            username = "(Retd.) " + username;
        }
        if (!playerDetails.getUsernameApproved()) {
            if ((Users.getHighestGmLevel() >= UIConstants.ADMIN_LEVEL_PLAYER_LOOKUP) || (Users.isAnyUser(playerDetails.getPlayerId()))) {
                return "× " + username + playerDetails.getUsername() + " ×";
            } else {
                return username + "× × ×";
            }
        }
        return username + playerDetails.getUsername();
    },

    getAdminStatus: function(playerDetails) {
        return playerDetails.getGmLevel() >= UIConstants.ADMIN_LEVEL_PLAYER_LOOKUP ? 'active' : TankTrouble.WallOfFame.admins.includes(playerDetails.getUsername()) ? 'retired' : 'false'
    }
});
