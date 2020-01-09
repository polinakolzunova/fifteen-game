$(function () {

    $("input[name='type']").prop("disabled", true);
    $("#start").click(function () {
        startGame();
    });
    $("#about-btn").click(function () {
        $(".screen-about").slideDown();
    });
    $(".screen-about #close-btn").click(function () {
        $(".screen-about").slideUp();
    });
    $(".aside input[name='color']").change(function () {
        $("#app").removeClass().addClass(this.value);
    });


    function startGame() {

        // объявление переменных
        let items = {
            type: "numbers",
            hole: 15,
            arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        };
        let time = {
            count: 0,
            el: $(".counters .timer .val"),
            interval: '',
        };
        let score = {
            el: $(".counters .throws .val"),
            count: 0,
        };

        // проверка на решаемость
        items.arr.sort(() => Math.random() - 0.5).concat(0);
        if (!solvable(items.arr)) {
            [items.arr[0], items.arr[1]] = [items.arr[1], items.arr[0]];
        }

        // установка внешнего вида
        $("#start")
            .text("Начать заново");
        $("input[name='type']")
            .prop("disabled", false);
        $("#box")
            .html("");
        for (var i = 0; i < 16; i++) {
            $("#box").append(`<div class="elem" id="el-${i + 1}" x-data="${i}"></div>`);
        }
        draw();

        // запуск таймера
        time.interval = setInterval(function () {
            time.count++;
            time.el.html(toText(time.count));
        }, 1000);

        // обаботчики событий
        $(".elem").click(function (e) {
            // добавляем обработчик нажатия на блоки элементов
            let step, index, completed;
            let id = parseInt($(this).attr("x-data"));

            if (id + 1 == items.hole) step = -1;
            else if (id - 1 == items.hole) step = 1;
            else if (id + 4 == items.hole) step = -4;
            else if (id - 4 == items.hole) step = 4;
            else return false;

            index = items.hole + step;
            [items.arr[index], items.arr[items.hole]] = [items.arr[items.hole], items.arr[index]];
            score.count++;
            score.el.html(score.count);
            items.hole = index;

            draw();

            completed = !items.arr.some(
                (item, i) => item > 0 && item - 1 !== i
            );
            if (completed) gameOver();

        });
        $(".aside input[name='type']").change(function () {
            // обработчик нажатия на метки цветовой темы для ее смены
            items.type = this.value;
            $("#box").removeClass().addClass(items.type);
            if (items.type == 'image') $(".aside .radio-field.image-field").fadeIn();
            else $(".aside .radio-field.image-field").fadeOut();
            draw();
        });
        $("#start").click(function () {
            // обработчик перезапуска игры
            window.location.reload();
        });


        function solvable(a) {
            let kDiff = 0;
            let len = a.length - 1;
            for (let i = 1; i < len; i++) {
                for (let j = i - 1; j >= 0; j--) {
                    if (a[j] > a[i]) {
                        kDiff++;
                    }
                }
            }
            return !(kDiff % 2);
        }

        function draw() {
            // функция изменение стилей блоков в соответствии с массивом
            $("#box .elem").each(function (i) {
                if (items.type == 'numbers') {
                    $(this).html(items.arr[i]);
                    $(this).css("background-image", "none");
                    $(this).css("visibility", items.arr[i] ? 'visible' : 'hidden');
                }
                else if (items.type == 'image') {
                    $(this).html("");
                    $(this).css("background-image", "url(/img/" + items.arr[i] + ".png)");
                    $(this).css("visibility", "visible");
                }
            })
        }

        function toText(time) {
            let str;
            let sec = time % 60;
            let min = Math.floor(time / 60);

            if (min == 0) str = "00:";
            else if (min < 10) str = "0" + min + ":";
            else str = min + ":";

            if (sec == 0) str += "00";
            else if (sec < 10) str += "0" + sec;
            else str += sec;

            return str;
        }

        function gameOver() {

            $(".screen-input-name").fadeIn();

            $(".screen-input-name #cancel-result").click(function () {
                $(".screen-input-name").fadeOut();
            });

            $("#name-form").submit(function (e) {
                e.preventDefault();
                let username = $("#name").val();
                $(".screen-input-name").fadeOut();
                $.ajax({
                    url: 'php/register.php',
                    type: 'post',
                    data: {
                        username: username,
                        score: score.count,
                        time: time.count,
                    },
                    success(data) {
                        getResults(data);
                    },
                    error() {
                        getResults("<tr><td colspan=4>Ошибка сохранения результата, сервер недоступен</td></tr>");
                    },
                });
            });
        }
    }


    function getResults(results) {

        $(".screen-results").fadeIn();
        $(".screen-results table tbody").html(results);
        $("#start-again").click(function () {
            window.location.reload();
        })

    }


});
