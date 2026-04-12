<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate {{ $certificate->certificate_code }}</title>
    <style>
        @page {
            margin: 0px;
        }
        body {
            margin: 0px;
            padding: 0px;
            font-family: sans-serif;
        }
        .certificate-container {
            position: relative;
            width: 100%;
            height: 100%;
            /* A4 Landscape dimensions roughly */
            min-height: 210mm;
            min-width: 297mm;
        }
        .background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        .element {
            position: absolute;
            white-space: nowrap;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        @if(isset($bg_base64) && $bg_base64)
            <img src="{{ $bg_base64 }}" class="background-image" alt="Background">
        @else
            <!-- Fallback to local storage path resolution -->
            @php
                $bgPath = str_replace('/storage/', '', $template->background_image);
                $fullBgPath = storage_path('app/public/' . $bgPath);
            @endphp
            
            @if(file_exists($fullBgPath))
                <img src="{{ 'data:image/jpeg;base64,' . base64_encode(file_get_contents($fullBgPath)) }}" class="background-image" alt="Background">
            @endif
        @endif

        @foreach($layout as $key => $props)
            @if($key === 'signature' || $key === 'qr_code')
                @continue
            @endif
            @php
                // Map the layout percentage to actual CSS. 
                // DomPDF supports absolute positioning but transform: translate(-50%, -50%) may have inconsistent support. 
                // So we'll try to rely on top/left offsets. 
                // However, since we stored left/top as percentages, we output them as is.
            @endphp
            
            <div class="element" style="
                left: {{ $props['x'] }}%;
                top: {{ $props['y'] }}%;
                font-size: {{ $props['fontSize'] }}px;
                color: {{ $props['color'] }};
                font-family: {{ $props['fontFamily'] ?? 'sans-serif' }};
                font-weight: {{ $props['fontWeight'] ?? 'normal' }};
                text-align: {{ $props['align'] }}; 
                
                @if($props['align'] === 'center')
                    transform: translateX(-50%) translateY(-50%);
                @elseif($props['align'] === 'right')
                    transform: translateX(-100%) translateY(-50%);
                @else
                    transform: translateY(-50%);
                @endif
            ">
                @if($key === 'student_name')
                    {{ $certificate->student->name }}
                @elseif($key === 'course_title')
                    {{ $certificate->course->title }}
                @elseif($key === 'date')
                    {{ $certificate->issued_at->format('d F Y') }}
                @elseif($key === 'certificate_code')
                    {{ $certificate->certificate_code }}
                @else
                    [{{ strtoupper(str_replace('_', ' ', $key)) }}]
                @endif
            </div>
        @endforeach

        {{-- Render Signature Image --}}
        @if($template->signature_image && isset($layout['signature']))
            @php
                $sigPath = str_replace('/storage/', '', $template->signature_image);
                $fullSigPath = storage_path('app/public/' . $sigPath);
                $sigLayout = $layout['signature'];
                $sigWidth = $sigLayout['width'] ?? 15;
            @endphp
            
            @if(file_exists($fullSigPath))
                <div style="
                    position: absolute;
                    left: {{ $sigLayout['x'] }}%;
                    top: {{ $sigLayout['y'] }}%;
                    transform: translateX(-50%) translateY(-50%);
                    width: {{ $sigWidth }}%;
                ">
                    <img src="{{ 'data:image/png;base64,' . base64_encode(file_get_contents($fullSigPath)) }}" style="width: 100%; height: auto;" alt="Signature">
                </div>
            @endif
        @endif

        {{-- Render QR Code Validation --}}
        @if(isset($layout['qr_code']) && !empty($layout['qr_code']['visible']))
            @php
                $qrLayout = $layout['qr_code'];
                $qrWidth = $qrLayout['width'] ?? 10;
                $verifyUrl = url('/verify-certificate?code=' . $certificate->certificate_code);
                
                // Base64 encode the PNG string to use in image src
                // format('png') requires ext-gd or ext-imagick, falling back to SVG if needed, but DomPDF prefers PNG/JPEG.
                // It is safer to use SVG and base64 encode it since modern DomPDF supports it,
                // actually Simple QR code SVG is standard string so base64 works.
                $qrSvg = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(200)->margin(1)->generate($verifyUrl);
            @endphp
            
            <div style="
                position: absolute;
                left: {{ $qrLayout['x'] }}%;
                top: {{ $qrLayout['y'] }}%;
                transform: translateX(-50%) translateY(-50%);
                width: {{ $qrWidth }}%;
            ">
                <img src="data:image/svg+xml;base64,{{ base64_encode($qrSvg) }}" style="width: 100%; height: auto;" alt="QR Code">
            </div>
        @endif
    </div>
</body>
</html>

