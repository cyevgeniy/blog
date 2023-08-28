---
title: "Linux hacks compilation"
date: 2017-01-16
---

## Легкая работа с архивами из консоли в linux

Довольно часто возникает необходимость работы с архивами из терминала.

Так как постоянно вводить нудные команды для их распаковки лень, на просторах интернета
был найден следующий код, который позволяет распаковывать одной короткой командой
большое количество разных архивов:

```bash
x(){
    if [ -f $1 ] ; then
            case $1 in
                    *.tar.bz2)   tar xvjf $1    ;;
                    *.tar.gz)    tar xvzf $1    ;;
                    *.bz2)       bunzip2 $1     ;;
                    *.rar)       unrar x $1     ;;
                    *.gz)        gunzip $1      ;;
                    *.tar)       tar xvf $1     ;;
                    *.tbz2)      tar xvjf $1    ;;
                    *.tgz)       tar xvzf $1    ;;
                    *.zip)       unzip $1       ;;
                    *.Z)         uncompress $1  ;;
                    *.7z)        7z x $1        ;;
                    *)           echo "Unable to extract '$1'" ;;
            esac
    else
            echo "'$1' is not a valid file"
    fi
}
```

Этот код можно добавить в файл ``.bashrc``. Для того, чтобы новой командой можно было
пользоваться без повторного входа в систему, можно выполнить следующую команду:

```bash
source ~/.bashrc
```
Теперь распаковывать архивы можно так:

```bash
x somearchive.tar.gz
```
### Создание архива

```bash
tgz(){
        tar -czf "$1.tar.gz" $1
}
```

Создавать архивы из директории или файла можно так:

```bash
tgz directory_to_compress
```

## Разбивка большого файла на части в linux

Часто возникает необходимость разбить большой файл на части. Я для этого использую следующую команду:

```bash
split --bytes 500M --numeric-suffixes --suffix-length=3 filename filename. 
```

Данная команда разобьет файл на части по 500 МБ, при этом автоматически добавит суффиксы
для нумерации частей(в данном случае суффикс будет состоять из трех символов, т.е. будет
равен 000, 001, и т.п).

## Запись действий с экрана в GIF на linux


Для записи происходящего на экране в изображение формата gif на linux можно воспользоваться программой byzanz.
Проблема в том, что для записи с экрана `byzanz` принимает координаты X и Y, а также значения ширины и высоты области, с которой нужно производить захват.
Решить эту проблему помогает скрипт `byzanz-record-window.sh`.
Найти одну из его вариаций легко на гитхабе. Вот пример работающего скрипта:

```bash
#!/bin/bash

# Delay before starting
DELAY=10

# Sound notification to let one know when recording is about to start (and ends)
beep() {
    paplay /usr/share/sounds/KDE-Im-Irc-Event.ogg &
}

# Duration and output file
if [ $# -gt 0 ]; then
    D="--duration=$@"
else
    echo Default recording duration 10s to /tmp/recorded.gif
    D="--duration=10 /tmp/recorded.gif"
fi
XWININFO=$(xwininfo)
read X <<< $(awk -F: '/Absolute upper-left X/{print $2}' <<< "$XWININFO")
read Y <<< $(awk -F: '/Absolute upper-left Y/{print $2}' <<< "$XWININFO")
read W <<< $(awk -F: '/Width/{print $2}' <<< "$XWININFO")
read H <<< $(awk -F: '/Height/{print $2}' <<< "$XWININFO")


echo X=$X

echo Delaying $DELAY seconds. After that, byzanz will start
for (( i=$DELAY; i>0; --i )) ; do
    echo $i
    sleep 1
done

beep
byzanz-record --verbose --delay=0 --x=$X --y=$Y --width=$W --height=$H $D
beep
```

Чтобы записать все происходящее на экране, нужно сохранить данный скрипт под
именем ```beyzanz-record-window.sh``` в домашнем каталоге, после чего выполнить команду

```bash
./beyzanz-record-window.xh 30 ~/record.gif
```
После ввода данной команды нужно будет щелкнуть мышкой по окну приложения, действия в котором нужно записать.
Скрипт начнет запись с задержкой в 10 секунд, после чего будет произведена запись продолжительностью в 30 секунд.

Результат будет сохранени в файле ``~/record.gif``:

![/img/recorded.gif](/img/recorded.gif)

## Кириллица в виртуальной консоли Linux

Для того, чтобы кириллица нормально отображалась в виртуальной консоли
linux(обычно доступна по Ctrl-Alt-F1..F7), достаточно выбрать шрифт, который поддерживает русский язык.

Сделать это можно следующим образом:

```bash
setfont ter-c16b
```
## How to merge multiple images into one

Merge files vertical:

```bash
convert image1.jpg image2.jpg -append cover.png
```

Merge files horizontal:</p>

```bash
convert image1.jpg image2.jpg +append cover.png
```

## Suspend laptop from command line

```bash
systemctl suspend
```
