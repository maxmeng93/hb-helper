## manifest.json 文件差异

- firefox

```json
{
  "background": {
    "scripts": ["src/background.js"]
  }
}
```

- chrome

```json
{
  "background": {
    "service_worker": "src/background.js",
    "type": "module"
  }
}
```
