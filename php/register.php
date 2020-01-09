<?php

if ( !empty($_POST)) {
    $username = $_POST['username'];
    $score = $_POST['score'];
    $time = $_POST['time'];
    $conn = new PDO('mysql:host=localhost;dbname=fifteen_db;charset=utf8', 'root', '', [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);

    if ($conn) {
        save($conn, $username, $score, $time);
        response($conn, $username, $score, $time);
    } else {
        echo "<tr><td colspan=4>Ошибка сохранения результата, база данных недоступна</td></tr>";
    }
}
else {
    echo "Вы кто такие? Я вас не звал. Идите .....";
}

function getStringTime($time)
{
    $str = "";
    $sec = $time % 60;
    $min = ($time - $sec) / 60;

    if ($min < 10) $str .= "0" . $min . ":";
    else $str .= $min . ":";

    if ($sec < 10) $str .= "0" . $sec;
    else $str .= $sec;

    return $str;
}

function save($conn, $username, $score, $time)
{
    $insert = $conn->prepare('INSERT INTO ranking(username, score, time) VALUES (?, ?, ?)');
    $insert->execute([
        $username,
        $score,
        $time
    ]);
}

function response($conn, $username, $score, $time)
{

    $i = 0;
    $table = "";
    $inTop = false;
    $select = $conn->query('SELECT * FROM ranking ORDER BY score LIMIT 10')->fetchAll();

    foreach ($select as $item) {

        $i++;

        if ($item['username'] == $username and $item['score'] == $score and $item['time'] == $time) {
            $inTop = true;
            $tr = "<tr class='active'>";
        } else
            $tr = "<tr>";

        $table .= "
            {$tr}
                <td>{$i}</td>
                <td>{$item['username']}</td>
                <td>{$item['score']}</td>
                <td>" . getStringTime($item['time']) . "</td>
            </tr>
        ";
    }

    if ( !$inTop) $table .= "<tr><td colspan=4>Вы не вошли в топ, попробуйте еще</td></tr>";

    echo $table;
}