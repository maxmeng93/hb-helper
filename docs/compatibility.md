## manifest.json 文件差异

### 1. `background` 字段

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
