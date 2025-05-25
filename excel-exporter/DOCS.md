# Documentation

## Configuration

This add-on needs no configuration all you have to do is start it and access the web ui.

## Downloading statistics

To download statistics fill the fields in the web ui and click "Download as .xlsx".
This will download your selected stats from the selected timeframe from the recorder.

![Screenshot of the Web UI](./screenshot.png)

If an entity does not have its state class set to "measurement", "total", or "total_increasing",
its states will only be saved up to 10 days, after which they will be deleted from the short-term
storage. Only entities with a set state class will be saved in long-term storage.

## License

```text
MIT License

Copyright (c) 2025 DerLev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
