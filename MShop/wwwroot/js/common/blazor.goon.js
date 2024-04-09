        function HideComponentsReconnectModal() {
            $("#components-reconnect-modal").hide();
        }

        var baseBlazorReconnectRejected;

        function BlazorReconnectRejected() {
            location.reload();
        }

        var baseBlazorReconnectFailed;

        function BlazorReconnectFailed() {
            //baseBlazorReconnectFailed();
            var crm = $("#components-reconnect-modal");
            var h5 = crm.children("h5");
            h5.html("Не удалось восстановить соединение. Дальнейшая работа будет возможна после возобновления работы сервера и перезагрузки страницы.<br>" +
                "<button onclick='HideComponentsReconnectModal()'>Скрыть это сообщение</button> <button onclick='location.reload()'>Перезагрузить</button>");
            crm.children("div").remove();
        }

        var reconnectFailedChangeIntervalId =
            setInterval(function () { 
                if (typeof Blazor != "undefined" && 
                    typeof Blazor.defaultReconnectionHandler != "undefined" && 
                    Blazor.defaultReconnectionHandler._reconnectionDisplay)
                {
                    var crm = $("#components-reconnect-modal");
                    crm.css("z-index", "1060");
                    
                    baseBlazorReconnectRejected = Blazor.defaultReconnectionHandler._reconnectionDisplay.__proto__.rejected;
                    Blazor.defaultReconnectionHandler._reconnectionDisplay.__proto__.rejected = BlazorReconnectRejected;

                    baseBlazorReconnectFailed = Blazor.defaultReconnectionHandler._reconnectionDisplay.__proto__.failed;
                    Blazor.defaultReconnectionHandler._reconnectionDisplay.__proto__.failed = BlazorReconnectFailed;

                    clearInterval(reconnectFailedChangeIntervalId);
                }
            }, 5000);
