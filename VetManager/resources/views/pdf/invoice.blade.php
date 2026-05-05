<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Factura {{ $invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            color: #333;
        }

        .header {
            display: table;
            width: 100%;
            border-bottom: 2px solid #2b6cb0;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }

        .company-info,
        .invoice-info {
            display: table-cell;
            vertical-align: top;
        }

        .company-info h1 {
            margin: 0;
            color: #2b6cb0;
            font-size: 24px;
        }

        .invoice-info {
            text-align: right;
        }

        .client-section {
            margin-bottom: 30px;
        }

        .client-section h3 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
            color: #4a5568;
        }

        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        table.items th,
        table.items td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }

        table.items th {
            background-color: #f7fafc;
            color: #4a5568;
        }

        .totals {
            float: right;
            width: 300px;
            text-align: right;
        }

        .totals tr td {
            padding: 8px;
        }

        .totals .grand-total {
            font-weight: bold;
            font-size: 18px;
            color: #2b6cb0;
            border-top: 2px solid #2b6cb0;
        }

        .footer {
            clear: both;
            margin-top: 50px;
            text-align: center;
            color: #718096;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
    </style>
</head>

<body>

    <div class="header">
        <div class="company-info">
            <h1>Veterinario Mmartin Clínica Veterinaria</h1>
            <p>Calle del Cuidado Animal, 123</p>
            <p>Madrid, 28000</p>
            <p>CIF: B-12345678</p>
        </div>
        <div class="invoice-info">
            <h2>FACTURA</h2>
            <p><strong>Nº Factura:</strong> {{ $invoice_number }}</p>
            <p><strong>Fecha:</strong> {{ $date }}</p>
        </div>
    </div>

    <div class="client-section">
        <h3>Datos del Cliente</h3>
        <p><strong>D/Dña:</strong> {{ $owner->name }}</p>
        <p><strong>Email:</strong> {{ $owner->email }}</p>
        <p><strong>Teléfono:</strong> {{ $owner->telefono }}</p>
        <p><strong>Paciente (Mascota):</strong> {{ $pet->name }} ({{ $pet->species }} - {{ $pet->breed }})</p>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Concepto / Tratamiento Médico</th>
                <th style="text-align: right;">Importe</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Consulta Veterinaria Estándar <br><small>Motivo diagnóstico: {{ $record->diagnosis }}</small></td>
                <td style="text-align: right;">{{ number_format($consultationFee, 2) }} &euro;</td>
            </tr>
            @if($product)
                <tr>
                    <td>Material / Medicina: {{ $product->name }} <br><small>{{ $product->category }}</small></td>
                    <td style="text-align: right;">{{ number_format($product->price, 2) }} &euro;</td>
                </tr>
            @endif
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Subtotal Base:</td>
            <td>{{ number_format($totalCost, 2) }} &euro;</td>
        </tr>
        <tr>
            <td>IVA (21%):</td>
            <td>{{ number_format($iva, 2) }} &euro;</td>
        </tr>
        <tr class="grand-total">
            <td>TOTAL A PAGAR:</td>
            <td>{{ number_format($grandTotal, 2) }} &euro;</td>
        </tr>
    </table>

    <div class="footer">
        <p>Gracias por confiar la salud de {{ $pet->name }} a Veterinario Mmartin Clínica Veterinaria.</p>
        <p>El pago debe realizarse antes de 15 días tras la emisión de la factura.</p>
    </div>

</body>

</html>