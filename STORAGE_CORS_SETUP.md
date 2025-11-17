# Решение проблемы CORS при загрузке изображений

## ✅ Решение уже реализовано!

Проблема CORS решена путем создания серверного API route в Next.js (`app/api/upload-image/route.ts`). Теперь загрузка изображений происходит через сервер, что полностью обходит ограничения CORS.

### Как это работает:
1. Клиент отправляет файл на `/api/upload-image`
2. API route загружает файл в Firebase Storage
3. API route возвращает URL загруженного изображения

**Никаких дополнительных настроек не требуется!** Просто перезапустите сервер разработки.

---

## Альтернативный способ: Настройка CORS через gsutil

Если вы хотите загружать файлы напрямую с клиента (без API route), можно настроить CORS:

1. Установите Google Cloud SDK, если еще не установлен:
   - Windows: https://cloud.google.com/sdk/docs/install
   - Mac: `brew install google-cloud-sdk`
   - Linux: следуйте инструкциям на https://cloud.google.com/sdk/docs/install

2. Авторизуйтесь в Google Cloud:
   ```bash
   gcloud auth login
   ```

3. Установите проект:
   ```bash
   gcloud config set project education-platform-226f0
   ```

4. Примените CORS конфигурацию:
   ```bash
   gsutil cors set cors.json gs://education-platform-226f0.firebasestorage.app
   ```

5. Проверьте, что CORS настроен:
   ```bash
   gsutil cors get gs://education-platform-226f0.firebasestorage.app
   ```

## Способ 2: Через Firebase Console

1. Откройте Firebase Console: https://console.firebase.google.com/
2. Выберите проект `education-platform-226f0`
3. Перейдите в Storage
4. Откройте вкладку "Rules"
5. Убедитесь, что правила позволяют загрузку (но CORS настраивается отдельно через gsutil)

## Способ 3: Альтернативное решение - использовать Firebase Storage через серверный API

Если настройка CORS через gsutil невозможна, можно создать API route в Next.js для загрузки файлов.

## Проверка

После настройки CORS, попробуйте загрузить изображение снова. Ошибка CORS должна исчезнуть.

